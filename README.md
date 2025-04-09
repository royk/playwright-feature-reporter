# playwright-feature-reporter
A custom Playwright reporter designed to automatically generate or populate Markdown documentation for your application based on its test suites & cases.

Based on [x-feature-reporter](https://github.com/royk/x-feature-reporter).

The below Features and To-Do sections were auto-generated from this reporter's test cases.

## Installation

```
npm i -D playwright-feature-reporter
```

<!-- playwright-feature-reporter--start -->
## Features
### Markdown generation
 - ✅ By default, multiple project don't create duplicate entries. Their features are merged
 - ✅ Describe blocks appear as headings. Nested describe blocks are nested headings
 - ✅ Tests appear as list items representing features. Each feature is visually marked as Passing ✅, Failing ❌ or Skipped 🚧
 - ✅ Tests can be annotated with test-types. Behavioral tests appear as features. Unannotated tests are assumed to be behavioral.
 - ✅ Describe blocks containing only non-behavioral tests are not shown in the report
 - ✅ Embed the report in an existing file between placeholders
 - ✅ Omit the closing placeholder if it's the last content in the file
 - ✅ Same headings from across suites are shown only once
 - ✅ Features can nest under other features
 - ✅ Features can nest multiple levels deep
### Configuration
 - ✅ Custom adapter can be provided as a constructor
 - ✅ Adapter is instantiated with the provided options
 - ✅ A link to a full test report will be included when the 'fullReportLink' option is provided
 - ✅ Projects are reported separately as headers when the option 'reportProjects' is true

[Test report](playwright-report/index.html)
<!-- playwright-feature-reporter--end -->

## Usage

### Basic usage
Include as a reporter in your `playwright.config.ts`. eg:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['playwright-feature-reporter', { 
      outputFile: './README.md',
      fullReportLink: 'https://raw.githack.com/your-repo/playwright-report/index.html'
    }]
  ]
});
```

### Using a custom adapter

You can provide a custom adapter class that implements the `XAdapter` interface from `x-feature-reporter`:

```typescript
import { defineConfig } from '@playwright/test';
import { MyCustomAdapter } from 'my-custom-adapter-package';

export default defineConfig({
  reporter: [
    ['playwright-feature-reporter', { 
      adapter: MyCustomAdapter,
      adapterOptions: {
        // adapter-specific options
      }
    }]
  ]
});
```

The adapter class must implement the `XAdapter` interface from `x-feature-reporter`:

```typescript
interface XAdapter {
  generateReport(suite: XTestSuite): void;
}
```

The adapter will be instantiated by the reporter with the provided `adapterOptions`.

### Combining with other reporters
This example takes advantage of the html reporter to attach a link to the full report:

```
export default defineConfig({
  reporter: [
    ['list'],
    ['html'],
    ['playwright-feature-reporter', {  outputFile: '../FEATURES.md', fullReportLink: 'playwright-report/index.html' }]
  ],
```
### Annotating tests

You can annotate tests with the following annotations:

- `test-type`: Used to annotate the type of test. Only tests with a test-type of `behavior` will be reported. Tests without the test-type annotation will be assumed to be `behavior` tests.

Example:
```
test('Example of a test with a test-type annotation', 
  {annotation: [{type: 'test-type', description: 'behavior'}]}, () => {
});
```

You can also similarly annotate a describe block. All tests within the describe block will inherit the annotation.

```
test.describe('Compatibility tests', 
  {annotation: [{type: 'test-type', description: 'compatibility'}]}, () => {
    test('this test will be annotated with "compatibility"', () => {
    });
});
```

### Indentations

Nesting level of headers is determined by the nesting level of the describe blocks:

```
test.describe('Main heading', () => {
  test.describe('Sub heading', () => {
    test('Feature under sub heading', () => {
    });
  });
});
```

Tests can be nested under other tests by prefixing them with `- ` (dash and space). The amount of `-` characters determines the nesting level.
The dashes and space will be trimmed from the feature name.

```
test.describe('Main heading', () => {
  test('Feature ', () => {
  });
  test('- Sub feature', () => {
  });
  test('-- Sub sub feature', () => {
  });
});
```

### Appending to an existing file
If you want to append the results to an existing file, include the following prefix in the file:

```
<!-- playwright-feature-reporter--start -->
```
You can additionally include a closing placeholder:

```
<!-- playwright-feature-reporter--end -->
```

For example:

```
# Features
<!-- playwright-feature-reporter--start -->
<< your features will be rendered here >>
```
## Configuration

### Output file
The output file is defined with the `outputFile` option.

### Report projects
By default, projects are not reported. This is to avoid duplicate entries in the report (where every test is reported each time per project).

If you want the projects to be reported, set the `reportProjects` option to true. Each project will be reported as a header and its features will be nested under it.

### Full report link
You can include a link to a full test report with the `fullReportLink` option. This will include the link at the bottom of the generated report.

Example:
```
['playwright-feature-reporter', { outputFile: './README.md', fullReportLink: 'playwright-report/index.html' }]
```