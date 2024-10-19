import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'],['html'],['./dist/index.js', { outputFile: './README.md', fullReportLink: 'playwright-report/index.html' }]] : [['list'],['html'],['./dist/index.js', { outputFile: './README.md', fullReportLink: 'playwright-report/index.html' }]],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'no-browser'
    }

  ]
});
