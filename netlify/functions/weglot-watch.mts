import type { Config } from '@netlify/functions'

/**
 * Asks GitHub to pull translation corrections out of Weglot.
 *
 * GitHub's own cron never fired for this workflow — an afternoon of runs, all
 * manual, none scheduled — and its docs allow five minutes at best while
 * warning that runs are delayed or dropped under load. Netlify schedules
 * reliably, so the trigger lives here while the work stays in the workflow.
 *
 * This used to check Weglot's `versions.translation` first and dispatch only
 * when it moved, which would have made a per-minute schedule almost free. That
 * premise was wrong: editing an existing translation does not move it. Proven
 * by two corrections sitting in Weglot's memory — "test alternative text" and a
 * deliberately mangled sentence — while the timestamp stayed put. It is the
 * only version field the settings endpoint exposes, so there is no cheap signal
 * to watch.
 *
 * The workflow compares the translations it fetches against the committed ones
 * and commits only on a real difference, so dispatching unconditionally is
 * correct — just not free. Ten minutes trades a little latency for a tenth of
 * the polling; the Actions tab has a Run workflow button for when that is too
 * slow.
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
  schedule: '*/10 * * * *',
}
