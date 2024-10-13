import type {
    FullConfig, FullResult, Reporter, Suite, TestCase, TestResult
  } from '@playwright/test/reporter';
  import fs from 'fs';
  let _suite: Suite;
  let _outputFile: string;
  class MyReporter implements Reporter {
    constructor(options: { outputFile?: string } = {}) {
      _outputFile = options.outputFile || 'FEATURES.md';
    }
    onBegin(config: FullConfig, suite: Suite) {
      _suite = suite;
    }
  
    onTestBegin(test: TestCase, result: TestResult) {
    }
  
    onTestEnd(test: TestCase, result: TestResult) {
    }
    
    
      
    onEnd(result: FullResult) {
  
      function getOutcome(testCase: TestCase) {
        switch (testCase.outcome()) {
          case 'skipped':
            return ':construction:';
          case 'expected':
            return ':white_check_mark:';
          case 'unexpected':
            return ':x:';
          case 'flaky':
            return ':warning:';
        }
        return testCase.outcome();
      }
      let nestedLevel = 0;
      let projectCount = 0;
      let stringBuilder = '';
      function mergeSuites(s: Suite, suiteStructure: Record<string, Suite>) {
        if (suiteStructure[s.title]) {
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
        return suiteStructure;
      }
      function printSuite(s: Suite) {
        const consolePrefix = '\t'.repeat(nestedLevel);
        const mdHeaderPrefix = '  '.repeat(nestedLevel) + '#'.repeat(nestedLevel+2);
        const mdListPrefix = '  '.repeat(nestedLevel) + '-';
        if (s.type === 'project') {
          projectCount++;
        }
        if (projectCount > 1) {
          return;
        }
        if (s.tests.length === 0 && s.suites.length === 0) {
          return;
        }
        if (s.type === 'describe') {
          if (nestedLevel===0) {
            stringBuilder += `${mdHeaderPrefix} ${s.title}\n`;
          } else {
            stringBuilder += `${mdHeaderPrefix} ${s.title}\n`;
          }
          nestedLevel++;
        }
        s.tests.forEach((test) => {
          const comment = test.annotations?.find((a) => a.type === 'comment')?.description;
          stringBuilder += `${mdListPrefix} ${getOutcome(test)} ${test.title}${comment ? ` *(${comment})*` : ''}\n`;
        });
        s.suites.forEach((ss) => {
          printSuite(ss);
        });
        if (s.type === 'describe') {
          nestedLevel--;
        }
      }
      mergeSuites(_suite, {});
      printSuite(_suite);
      fs.writeFileSync(_outputFile, stringBuilder);
    }
  }
  
  export default MyReporter;