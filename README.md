# playwright-feature-reporter
Custom Playwright reporter that generates a Markdown file documenting app features based on test cases

(still under development)

## Usage

Include as a reporter in your playwright.config.ts. eg:

```
export default defineConfig({
  reporter: process.env.CI ? 'github' :[
    ['list'],
    ['playwright-feature-reporter', {  outputFile: '../FEATURES.md' }]
  ],
```

## Features
- 'Describe' block is rendered as a header
- Nested describe blocks are indented to represent subfeatures.
- 'Test' block is rendered as a list item
- passing, failing and skipped tests are represented by appropriate markers
- 'Comment' annotation is rendered as a comment

## Configuration
- `outputFile` - name and location of the generated Markdown
