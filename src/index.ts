import type {
    FullConfig, FullResult, Reporter, Suite, TestCase, TestResult
  } from '@playwright/test/reporter';
import { XFeatureReporter, TestSuite as XTestSuite, TestResult as XTestResult } from 'x-feature-reporter';
import { MarkdownAdapter } from 'x-feature-reporter/adapters/markdown';
let _suite: Suite;

export const embeddingPlaceholder = 'playwright-feature-reporter';
export const ANNOTATION_TEST_TYPE = 'test-type';
export const TEST_TYPE_BEHAVIOR = 'behavior';
export const PLAYWRIGHT_SUITE_TYPE_DESCRIBE = 'describe';
// TODO: Add some test that uses this type
export const PLAYWRIGHT_SUITE_TYPE_PROJECT = 'project';

class MyReporter implements Reporter {
  private options: { outputFile?: string, fullReportLink?: string };
  constructor(options: { outputFile?: string, fullReportLink?: string } = {}) {
    this.options = options;
  }
  onBegin(config: FullConfig, suite: Suite) {
    _suite = suite;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTestBegin(test: TestCase, result: TestResult) {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTestEnd(test: TestCase, result: TestResult) {
  }

  _outcomeToStatus(outcome: string) {
    switch (outcome) {
      case 'skipped': return 'skipped';
      case 'expected': return 'passed';
      case 'unexpected': return 'failed';
    }
    return outcome;
  }

  _convertSuiteToXFeatureReporter(s: Suite) {
    const xSuite = {
      title: s.title,
      transparent: s.type !== PLAYWRIGHT_SUITE_TYPE_DESCRIBE,
      suites: [],
      tests: [],
    } as XTestSuite;
    xSuite.suites = s.suites.map((ss) => this._convertSuiteToXFeatureReporter(ss));
    xSuite.tests = s.tests.map((t) => {
      return {
        title: t.title,
        status: this._outcomeToStatus(t.outcome()),
        testType: t.annotations?.find((a) => a.type === ANNOTATION_TEST_TYPE)?.description,
      } as XTestResult;
    });
    return xSuite;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEnd(result: FullResult) {
    const suite = this._convertSuiteToXFeatureReporter(_suite);
    const reporter = new XFeatureReporter(new MarkdownAdapter({
      outputFile: this.options.outputFile,
      fullReportLink: this.options.fullReportLink,
      embeddingPlaceholder
    }));
    reporter.generateReport(suite);
  }
}

export default MyReporter;