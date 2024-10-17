# playwright-feature-reporter
Custom Playwright reporter for self-documenting via tests. Populates a Markdown file documenting app features based on test cases.

(the below features and to-do sections are auto-generated from the reporter's test cases)

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
  - :white_check_mark: Supports embedding markdown in an existing file between placeholders
  - :white_check_mark: Supports embedding markdown in an existing file without closing placeholder
  - :white_check_mark: Merges features from across suites
  ### Configuration
  - :white_check_mark: Define output file with 'outputFile' option *(Implicitly tested)*
## To do
- :construction: Supports embedding different test types in different parts of the document
- :construction: Display generation date
- :construction: Support for skipping a test from being reported
- :construction: Support for marking a describe block as skipped, and show all its children as skipped
- :construction: Supports marking a block with a test-type annotation and have its children inherit the annotation
- :construction: Support custom emojis
- :construction: Support including a link for a full test report
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
