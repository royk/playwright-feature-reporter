# playwright-feature-reporter
Custom Playwright reporter for self-documenting via tests. Populates a Markdown file documenting app features based on test cases.

(the below features and to-do sections are auto-generated from the reporter's test cases)

## Installation

```
npm i -D playwright-feature-reporter
```

<!-- jest-playwright-feature-reporter--placeholder -->
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
- :construction: Support custom emojis
<!-- jest-playwright-feature-reporter--placeholder-end -->

## Usage

### Basic usage
Include as a reporter in your playwright.config.ts. eg:

```
export default defineConfig({
  reporter: process.env.CI ? 'github' :[
    ['list'],
    ['playwright-feature-reporter', {  outputFile: '../FEATURES.md' }]
  ],
```
### Appending to an existing file
If you want to append the results to an existing file, include the following prefix in the file:

```
<!-- jest-playwright-feature-reporter--placeholder -->
```
You can additionally include a closing placeholder:

```
<!-- jest-playwright-feature-reporter--placeholder-end -->
```

For exmaple:

```
# Features
<!-- jest-playwright-feature-reporter--placeholder -->
<< your features will be rendered here >>
```
