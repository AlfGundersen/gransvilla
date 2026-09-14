import type { Config } from '@netlify/functions'

/**
 * Watches Weglot for translation changes and asks GitHub to pull them in.
 *
 * GitHub's own cron never fired for this workflow — fifteen runs over an
 * afternoon, all manual, none scheduled. Its docs allow five minutes at best
 * and say runs are delayed or dropped under load. Netlify schedules down to a
 * minute and actually keeps to it, so the trigger lives here while the work
 * stays in the workflow, which does run correctly when asked.
 *
 * The check is two small requests: Weglot's settings endpoint exposes
 * `versions.translation`, a timestamp that moves whenever translations change,
 * and the marker committed alongside messages/ says which one we last pulled.
 * The workflow is only dispatched when they differ, so a per-minute schedule
 * costs almost nothing and the Actions log stays readable.
 */

const REPO = 'AlfGundersen/gransvilla'
/**
 * Read through the Contents API, not raw.githubusercontent.com.
 *
 * Raw is served with max-age=300, so after a run committed a new marker the
 * watcher kept reading the old one for five minutes and re-dispatched every
 * minute. The API caches for 60s, which is the interval we run on.
 */
const MARKER = `https://api.github.com/repos/${REPO}/contents/messages/.weglot-version`
const WORKFLOW = 'refresh-translations.yml'

const githubHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
})

export default async () => {
  const weglotKey = Netlify.env.get('NEXT_PUBLIC_WEGLOT_API_KEY')
  const githubToken = Netlify.env.get('GITHUB_DISPATCH_TOKEN')

  if (!weglotKey || !githubToken) {
    console.error('Missing NEXT_PUBLIC_WEGLOT_API_KEY or GITHUB_DISPATCH_TOKEN')
    return
  }

  const settings = await fetch(
    `https://api.weglot.com/projects/settings?api_key=${encodeURIComponent(weglotKey)}`,
    { signal: AbortSignal.timeout(10_000) },
  ).catch(() => null)

  if (!settings?.ok) {
    // Weglot being unreachable is not worth a deploy; the next run will see it.
    console.warn('Could not reach Weglot; skipping this run.')
    return
  }

  const remote = String(
    ((await settings.json()) as { versions?: { translation?: number } })?.versions?.translation ??
      '',
  )
  if (!remote) {
    console.warn('No versions.translation in the Weglot response; skipping.')
    return
  }

  const local = await fetch(MARKER, {
    headers: { ...githubHeaders(githubToken), Accept: 'application/vnd.github.raw' },
    signal: AbortSignal.timeout(10_000),
  })
    .then((r) => (r.ok ? r.text() : ''))
    .then((t) => t.trim())
    .catch(() => '')

  if (remote === local) {
    console.log(`Weglot unchanged at ${remote}.`)
    return
  }

  // A run takes longer than the minute between checks, and the marker only
  // changes once it commits — so without this the same difference is seen
  // several times and dispatches a run each time.
  const inFlight = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/runs` +
      '?status=in_progress&per_page=1',
    { headers: githubHeaders(githubToken), signal: AbortSignal.timeout(10_000) },
  )
    .then((r) => (r.ok ? (r.json() as Promise<{ total_count?: number }>) : null))
    .catch(() => null)

  const queued = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/runs` +
      '?status=queued&per_page=1',
    { headers: githubHeaders(githubToken), signal: AbortSignal.timeout(10_000) },
  )
    .then((r) => (r.ok ? (r.json() as Promise<{ total_count?: number }>) : null))
    .catch(() => null)

  const busy = (inFlight?.total_count ?? 0) + (queued?.total_count ?? 0)
  if (busy > 0) {
    console.log(`Weglot moved to ${remote}, but a run is already going. Waiting.`)
    return
  }

  console.log(`Weglot moved: ${local || 'none'} → ${remote}. Dispatching ${WORKFLOW}.`)

  const dispatch = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: { ...githubHeaders(githubToken), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'main' }),
      signal: AbortSignal.timeout(15_000),
    },
  )

  if (!dispatch.ok) {
    console.error(`GitHub refused the dispatch: ${dispatch.status} ${await dispatch.text()}`)
  }
}

export const config: Config = {
  schedule: '* * * * *',
}
