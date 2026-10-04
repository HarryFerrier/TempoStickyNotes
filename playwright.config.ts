import { defineConfig } from '@playwright/test'

const PORT = 4321

export default defineConfig({
  testDir: 'e2e',
  // *.e2e.ts, so Vitest's default *.test.ts / *.spec.ts pattern never picks these up.
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The installed Chrome, so no browser download is needed. Without Chrome, run
    // `npx playwright install chromium` and remove this line.
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
  },
  // Tests run against the production build, the way reviewers would serve it.
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
  },
})
