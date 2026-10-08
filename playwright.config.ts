import { defineConfig } from '@playwright/test'

// The staff password and the Shopify keys the site itself runs on
try {
  process.loadEnvFile('.env.local')
} catch {
  // No file in CI; the tests that need a secret skip themselves
}

const PORT = 3100

/**
 * Browser tests of the things that cost money or trust when they break: the
 * cart, the dates, the staff lists, and that a page change is one quiet fade.
 *
 * Run with `pnpm test:e2e`, before a deploy rather than on every save: they
 * drive the real shop, so each run leaves a few never-paid carts in Shopify.
 *
 * They run against a production build, not `next dev`. The two differ exactly
 * where it has hurt: a page that renders in dev can still fail to prerender.
 * Set E2E_BASE_URL to aim them at a deploy preview or the live site instead.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  // One at a time: the tests share a shop, and the staff login is rate-limited
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`,
    // The Chrome already on the machine, so there is no browser to download
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        // Built from scratch. Next keeps fetched data between local builds, and
        // a build that prerendered from last week's answers once served a 404
        // for a product that exists.
        command: `rm -rf .next/cache/fetch-cache && pnpm build && pnpm exec next start -p ${PORT}`,
        url: `http://localhost:${PORT}/kontakt`,
        timeout: 300_000,
        reuseExistingServer: false,
      },
})
