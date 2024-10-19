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
  - :white_check_mark: Supports nested describe blocks
  - :white_check_mark: Marks passing, failing and skipped tests
  - :white_check_mark: Supports comment annotations
  - :white_check_mark: Supports test-type annotations, and doesn't report non-behavioral tests
  - :white_check_mark: Supports Describe block annotations
  - :white_check_mark: Supports embedding markdown in an existing file between placeholders
  - :white_check_mark: Supports embedding markdown in an existing file without closing placeholder
  - :white_check_mark: Merges features from across suites
  ### Configuration
  - :white_check_mark: Define output file with 'outputFile' option *(Implicitly tested)*
## To do
- :construction: Support including a link to a full test report
- :construction: Display generation date
- :construction: Supports embedding different test types in different parts of the document
- :construction: Support custom emojis
<!-- playwright-feature-reporter--end -->

## Usage

### Basic usage
Include as a reporter in your playwright.config.ts. eg:

```
export default defineConfig({
  reporter: [
    ['list'],
    ['playwright-feature-reporter', {  outputFile: '../FEATURES.md' }]
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
