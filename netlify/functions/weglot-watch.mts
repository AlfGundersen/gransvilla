import type { Config } from '@netlify/functions'

/**
 * Keeps the committed dictionary in step with Weglot.
 *
 * Pages ask Weglot directly now, so this is no longer what makes a correction
 * visible — that happens within the page's revalidation window. What it does is
 * keep messages/en.json current, so the fallback the site drops to when Weglot
 * is unreachable is a recent one rather than whatever was true at the last
 * deploy. Hourly is plenty for that.
 *
 * It dispatches unconditionally because Weglot exposes no signal that moves
 * when a translation is edited: versions.translation, the only version field in
 * the settings endpoint, stayed put while two corrections sat in its memory.
 * The workflow compares what it fetches against what is committed and commits
 * only on a real difference.
 */

const REPO = 'AlfGundersen/gransvilla'
const WORKFLOW = 'refresh-translations.yml'

const githubHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
})

async function runsWithStatus(token: string, status: string): Promise<number> {
  return fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/runs` +
      `?status=${status}&per_page=1`,
    { headers: githubHeaders(token), signal: AbortSignal.timeout(10_000) },
  )
    .then((r) => (r.ok ? (r.json() as Promise<{ total_count?: number }>) : null))
    .then((d) => d?.total_count ?? 0)
    .catch(() => 0)
}

export default async () => {
  const githubToken = Netlify.env.get('GITHUB_DISPATCH_TOKEN')

  if (!githubToken) {
    console.error('Missing GITHUB_DISPATCH_TOKEN')
    return
  }

  // A run outlasts the gap between checks, so without this a slow one would be
  // followed by a second dispatch doing the same work.
  const busy =
    (await runsWithStatus(githubToken, 'in_progress')) +
    (await runsWithStatus(githubToken, 'queued'))

  if (busy > 0) {
    console.log('A refresh is already running. Waiting.')
    return
  }

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
    return
  }

  console.log(`Dispatched ${WORKFLOW}.`)
}

export const config: Config = {
  schedule: '7 * * * *',
}
