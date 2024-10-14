# playwright-feature-reporter
Custom Playwright reporter that populates a Markdown file documenting app features based on test cases

(the below features and to do sections are auto-generated from the test cases)

<!-- jest-playwright-feature-reporter--placeholder -->
## Features
  ### Markdown generation
  - :white_check_mark: Supports nested describe blocks
  - :white_check_mark: Marks passing, failing and skipped tests
  - :white_check_mark: Supports comment annotations
  - :white_check_mark: Supports embedding markdown in an existing file between placeholders
  - :white_check_mark: Supports embedding markdown in an existing file without closing placeholder
  - :white_check_mark: Merges features from across suites
  ### Configuration
  - :white_check_mark: Define output file with 'outputFile' option *(Implicitly tested)*
## To do
- :construction: Display generation date
- :construction: Support for skipping a test from being reported
- :construction: Support for skipping a describe block and still report its children
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

## Features
- 'Describe' block is rendered as a header
- Nested describe blocks are indented to represent subfeatures.
- 'Test' block is rendered as a list item
- passing, failing and skipped tests are represented by appropriate markers
- 'Comment' annotation is rendered as a comment
- Test results are appended to the feature file without overwriting it.
## Configuration
- `outputFile` - name and location of the generated Markdown
