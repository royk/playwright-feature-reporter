import type {
    FullConfig, FullResult, Reporter, Suite, TestCase, TestResult
  } from '@playwright/test/reporter';
import { XFeatureReporter, XTestSuite as XTestSuite, XTestResult as XTestResult } from 'x-feature-reporter';
import { MarkdownAdapter, MarkdownAdapterOptions } from 'x-feature-reporter/adapters/markdown';

export const embeddingPlaceholder = 'playwright-feature-reporter';
export const ANNOTATION_TEST_TYPE = 'test-type';
export const TEST_TYPE_BEHAVIOR = 'behavior';
export const PLAYWRIGHT_SUITE_TYPE_DESCRIBE = 'describe';
// TODO: Add some test that uses this type
export const PLAYWRIGHT_SUITE_TYPE_PROJECT = 'project';

type ReporterOptions = { 
  outputFile?: string, 
  fullReportLink?: string, 
  reportProjects?: boolean 
};

class MyReporter implements Reporter {
  // todo: create type
  private options: ReporterOptions;
  private suite: Suite;
  constructor(options: ReporterOptions = {}) {
    if (options.reportProjects==undefined) {
      options.reportProjects = false;
    }
    this.options = options;
  }
  onBegin(config: FullConfig, suite: Suite) {
    this.suite = suite;
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
      case 'flaky': return 'failed';
    }
    return outcome;
  }

  _convertSuiteToXFeatureReporter(s: Suite) {
    let isTransparent = true;
    if (s.type === PLAYWRIGHT_SUITE_TYPE_DESCRIBE) {
      isTransparent = false;
    }
    if (s.type === PLAYWRIGHT_SUITE_TYPE_PROJECT && this.options.reportProjects==true) {
      isTransparent = false;
    }
    const xSuite = {
      title: this.options.reportProjects==false && s.type === PLAYWRIGHT_SUITE_TYPE_PROJECT ? '' : s.title,
      transparent: isTransparent,
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
    const xsuite = this._convertSuiteToXFeatureReporter(this.suite);
    const reporter = new XFeatureReporter(new MarkdownAdapter({
      outputFile: this.options.outputFile,
      fullReportLink: this.options.fullReportLink,
      embeddingPlaceholder
    } as MarkdownAdapterOptions));
    reporter.generateReport(xsuite);
  }
}

export default MyReporter;