import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'],['./dist/index.js', { outputFile: './README.md' }]] : [['list'], ['./dist/index.js', { outputFile: './README.md' }]],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'no-browser'
    }

  ]
});
