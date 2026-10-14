import { defineConfig } from '@playwright/test';

// ponytail: Chromium desktop and narrow viewport only; add engines after named browser support is agreed.
export default defineConfig({
  testDir: './test/e2e',
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4226', browserName: 'chromium', channel: process.env.TW16_BROWSER_CHANNEL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'narrow', use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npm run preview -- --port 4226 --strictPort',
    url: 'http://127.0.0.1:4226',
    reuseExistingServer: false,
  },
});
