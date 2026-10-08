import { defineConfig } from '@playwright/test'

/** Plain logic, no browser and no server: `pnpm test:unit`. */
export default defineConfig({
  testDir: '.',
  reporter: 'list',
})
