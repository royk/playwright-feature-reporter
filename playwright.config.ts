import { defineConfig, devices } from '@playwright/test';

const isWatch = process.env.PWTEST_WATCH === '1';
const localReporter = isWatch ? 'list' : [['list'],['html'],['./dist/index.js', { outputFile: './README.md', fullReportLink: 'playwright-report/index.html' }]];
export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // @ts-ignore
  reporter: process.env.CI ? [['github'],
                              ['html'],
                              ['./dist/index.js', { outputFile: './README.md', fullReportLink: 'https://raw.githack.com/royk/playwright-feature-reporter/refs/heads/main/playwright-report/index.html' }]] 
                              : localReporter,
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'no-browser'
    }

  ]
});
