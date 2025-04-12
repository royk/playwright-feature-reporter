import type {
    FullConfig, FullResult, Reporter, TestCase, TestResult, Suite
  } from '@playwright/test/reporter';
import type { XTestSuite as XTestSuite, XTestResult as XTestResult, XAdapter, JsonAdapterOptions } from 'x-feature-reporter';
import type { MarkdownAdapterOptions } from 'x-feature-reporter/adapters/markdown';
import { MarkdownAdapter } from 'x-feature-reporter/adapters/markdown';
import { XFeatureReporter } from 'x-feature-reporter';
import { JsonAdapter } from 'x-feature-reporter/adapters/json';

export const embeddingPlaceholder = 'playwright-feature-reporter';
export const ANNOTATION_TEST_TYPE = 'test-type';
export const TEST_TYPE_BEHAVIOR = 'behavior';
export const PLAYWRIGHT_SUITE_TYPE_DESCRIBE = 'describe';
export const PLAYWRIGHT_SUITE_TYPE_PROJECT = 'project';

export interface ReporterOptions {
  outputFile?: string;
  outputFormat?: 'markdown' | 'json';
  fullReportLink?: string;
  reportProjects?: boolean;
  embeddingPlaceholder?: string;
  lastResultsFile?: string;
}

class MyReporter implements Reporter {
  private options: ReporterOptions;
  private suite: Suite;
  constructor(options: ReporterOptions = {}) {
    this.options = {
      ...options,
      reportProjects: options.reportProjects ?? false
    };
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
    // only describe blocks are visible by default. Projects are visible only when the option 'reportProjects' is true.
    const visible = (s.type === PLAYWRIGHT_SUITE_TYPE_DESCRIBE ||
      (s.type === PLAYWRIGHT_SUITE_TYPE_PROJECT && this.options.reportProjects==true));
    // if projects are not reported, clear their titles so that their children share the same ancestry path (causes merging)
    const title = this.options.reportProjects==false && s.type === PLAYWRIGHT_SUITE_TYPE_PROJECT ? '' : s.title;
    const xSuite = {
      title,
      transparent: !visible,
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
    let adapter: XAdapter;
    this.options.embeddingPlaceholder = this.options.embeddingPlaceholder ?? embeddingPlaceholder;
    if (!this.options.outputFormat) {
      this.options.outputFormat = 'markdown';
    }
    if (this.options.outputFormat === 'markdown') {
      adapter = new MarkdownAdapter({
        outputFile: this.options.outputFile,
        fullReportLink: this.options.fullReportLink,
        embeddingPlaceholder: this.options.embeddingPlaceholder
      } as MarkdownAdapterOptions);
    } else {
      adapter = new JsonAdapter({
        outputFile: this.options.outputFile,
      } as JsonAdapterOptions);
    }
    
    const reporter = new XFeatureReporter(adapter);
    reporter.generateReport(xsuite, this.options.lastResultsFile);
  }
}

export default MyReporter;