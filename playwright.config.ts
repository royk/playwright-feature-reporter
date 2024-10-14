import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['./dist/index.js', { outputFile: './README.md' }]],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'no-browser'
    }

  ]
});