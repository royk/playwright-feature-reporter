# playwright-feature-reporter
A custom Playwright reporter designed to automatically generate or populate Markdown documentation for your application based on its test suites & cases.

The below Features and To-Do sections were auto-generated from this reporter's test cases.

## Installation

```
npm i -D playwright-feature-reporter
```

<!-- playwright-feature-reporter--start -->
## Features
  ### Markdown generation
  - :white_check_mark: Describe blocks appear as headings. Nested describe blocks are nested headings
  - :white_check_mark: Tests appear as list items representing features. Each feature is visually marked as Passing :white_check_mark:, Failing :x: or Skipped :construction:
  - :white_check_mark: Comment annotations appear as *(italics)* after the feature description
  - :white_check_mark: Tests can be annotated with test-types. Behavioral tests appear as features. Unannotated tests are assumed to be behavioral.
    - :white_check_mark: Describe blocks containing only non-behavioral tests are not shown in the report
  - :white_check_mark: Embed the report in an existing file between placeholders
    - :white_check_mark: Omit the closing placeholder if it's the last content in the file
  - :white_check_mark: Same headings from across suites are shown only once
  - :white_check_mark: Features can nest under other features
    - :white_check_mark: Features can nest multiple levels deep
  ### Configuration
  - :white_check_mark: Define where to embed the report with 'outputFile' option *(Implicitly tested)*
  - :white_check_mark: A link to a full test report will be included when the 'fullReportLink' option is provided
## To do
- :construction: Display generation date
- :construction: Support embedding different test types in different parts of the document
- :construction: Support custom emojis

[Test report](https://raw.githack.com/royk/playwright-feature-reporter/refs/heads/main/playwright-report/index.html)
<!-- playwright-feature-reporter--end -->

## Usage

### Basic usage
Include as a reporter in your `playwright.config.ts`. eg:

```
export default defineConfig({
  reporter: [
    ['list'],
    ['playwright-feature-reporter', {  outputFile: '../FEATURES.md' }]
  ],
```

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
- `comment`: Used to add a comment to a test. The comment will appear in parentheses after the test name.

Example:
```
test('Example of a test with a comment', 
  {annotation: [{type: 'comment', description: 'This is an example comment'}]}, () => {
});

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

Tests can be nested under other tests by prefixing them with `- ` (space and dash). The amount of `-` characters determines the nesting level.
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

### Full report link
You can include a link to a full test report with the `fullReportLink` option. This will include the link at the bottom of the generated report.

Example:
```
['playwright-feature-reporter', { outputFile: './README.md', fullReportLink: 'playwright-report/index.html' }]
```