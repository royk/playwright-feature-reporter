import type {
    FullConfig, FullResult, Reporter, Suite, TestCase, TestResult
  } from '@playwright/test/reporter';
  import fs from 'fs';
let _suite: Suite;
let _outputFile: string;
let _fullReportLink: string;
export const embeddingPlaceholder = "<!-- playwright-feature-reporter--start -->";
export const embeddingPlaceholderEnd = "<!-- playwright-feature-reporter--end -->";
export const oldPlaceholderStart = "<!-- jest-playwright-feature-reporter--placeholder -->";
export const oldPlaceholderEnd = "<!-- jest-playwright-feature-reporter--placeholder-end -->";


export const ANNOTATION_TEST_TYPE = 'test-type';
export const ANNOTATION_COMMENT = 'comment';

export const TEST_TYPE_BEHAVIOR = 'behavior';

export const PLAYWRIGHT_SUITE_TYPE_DESCRIBE = 'describe';
// TODO: Add some test that uses this type
export const PLAYWRIGHT_SUITE_TYPE_PROJECT = 'project';

class MyReporter implements Reporter {
  constructor(options: { outputFile?: string, fullReportLink?: string } = {}) {
    _outputFile = options.outputFile || 'FEATURES.md';
    _fullReportLink = options.fullReportLink;
  }
  onBegin(config: FullConfig, suite: Suite) {
    _suite = suite;
  }

  onTestBegin(test: TestCase, result: TestResult) {
  }

  onTestEnd(test: TestCase, result: TestResult) {
  }
  
  
    
  onEnd(result: FullResult) {

    function getOutcome(testCase) {
      switch (testCase.outcome) {
        case 'skipped':
          return ':construction:';
        case 'expected':
          return ':white_check_mark:';
        case 'unexpected':
          return ':x:';
        case 'flaky':
          return ':warning:';
      }
      return testCase.outcome;
    }
    
    function suiteToJson(s: Suite) {
      const sJson = {
        title: s.title,
        type: s.type,
        suites: [],
        tests: [],
      };
      sJson.suites = s.suites.map((ss) => suiteToJson(ss));
      sJson.tests = s.tests.map((t) => {
        return {
          title: t.title,
          outcome: t.outcome(),
          annotations: t.annotations,
        }
      });

      return sJson;
    }
    function mergeSuites(s, suiteStructure: Record<string, Suite>) {
      if (s.type===PLAYWRIGHT_SUITE_TYPE_DESCRIBE && suiteStructure[s.title]) {
        suiteStructure[s.title].tests.push(...s.tests);
        suiteStructure[s.title].suites.push(...s.suites);
        s.tests = [];
        s.suites = [];
      } else {
        suiteStructure[s.title] = s;
      }
      s.suites.forEach((ss) => {
        mergeSuites(ss, suiteStructure);
      });
      return s;
    }

    function willPrintTest(test: TestCase) {
      const testType = test.annotations?.find((a) => a.type === ANNOTATION_TEST_TYPE)?.description;
      if (testType && testType !== TEST_TYPE_BEHAVIOR) {
        return;
      }
      return true;
    }

    function printSuite(s: Suite) {
      const myNestedLevel = nestedLevel;
      const headerPrefix = '  '.repeat(nestedLevel) + '#'.repeat(nestedLevel+2);
      
      if (s.type === PLAYWRIGHT_SUITE_TYPE_PROJECT) {
        projectCount++;
      }
      if (projectCount > 1) {
        return;
      }
      if (s.tests.length === 0 && s.suites.length === 0) {
        return;
      }
      if (s.type === PLAYWRIGHT_SUITE_TYPE_DESCRIBE) {
        const printableTests = s.tests.filter((test) => willPrintTest(test));
        // if there are no tests and no nested suites, don't print the suite
        // TODO: Consider differentiating between no tests and no printable tests
        if (s.suites.length === 0 && printableTests.length === 0) {
          return;
        }
        stringBuilder += `${headerPrefix} ${s.title}\n`;
        nestedLevel++;
      }
      const testNames = [];
      s.tests
      .filter((test) => willPrintTest(test))
      .forEach((test) => {
        if (testNames.includes(test.title)) {
          return;
        }
       
        testNames.push(test.title);
        let testTitle = test.title;
        let additionalNesting = 0;
        if (testTitle.startsWith('-')) {
          additionalNesting = testTitle.indexOf(' ');
          testTitle = testTitle.slice(additionalNesting+1);
        }
        const listPrefix = '  '.repeat(myNestedLevel + additionalNesting) + '-';
        const comment = test.annotations?.find((a) => a.type === ANNOTATION_COMMENT)?.description;
        stringBuilder += `${listPrefix} ${getOutcome(test)} ${testTitle}${comment ? ` *(${comment})*` : ''}\n`;
      });
      s.suites.forEach((ss) => {
        printSuite(ss);
      });
      if (s.type === PLAYWRIGHT_SUITE_TYPE_DESCRIBE) {
        nestedLevel--;
      }
    }

    function getPlaceholderNames(existingContent: string) {
      let placeholderStartString = embeddingPlaceholder;
      let placeholderEndString = embeddingPlaceholderEnd;
      // backwards compatibility for old placeholder names
      if (existingContent.includes(oldPlaceholderStart)) {
        placeholderStartString = oldPlaceholderStart;
        placeholderEndString = oldPlaceholderEnd;
      }
      return { placeholderStartString, placeholderEndString };
    }

    function generateMarkdown(stringBuilder: string) {
      const existingContent = fs.existsSync(_outputFile) ? fs.readFileSync(_outputFile, 'utf8') : '';
      let { placeholderStartString, placeholderEndString } = getPlaceholderNames(existingContent);
      if (existingContent.includes(placeholderStartString)) {
        let endPlaceholderIndex = existingContent.indexOf(placeholderEndString);
        if (endPlaceholderIndex==-1) {
          endPlaceholderIndex = existingContent.length;
        }
        let startPlaceholderIndex = existingContent.indexOf(placeholderStartString);
        const newContent = existingContent.slice(0, startPlaceholderIndex) + placeholderStartString + stringBuilder + existingContent.slice(endPlaceholderIndex);
        fs.writeFileSync(_outputFile, newContent);
      } else {
        fs.writeFileSync(_outputFile, stringBuilder);
      }
    }
    const mergedSuite = mergeSuites(suiteToJson(_suite), {});
    let nestedLevel = 0;
    let projectCount = 0;
    let stringBuilder = '\n';
    printSuite(mergedSuite);
    if (_fullReportLink) {
      stringBuilder += `\n[Test report](${_fullReportLink})\n`;
    }
    generateMarkdown(stringBuilder);

    
  }
}

export default MyReporter;