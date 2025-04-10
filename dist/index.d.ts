import type { FullConfig, FullResult, Reporter, TestCase, TestResult, Suite } from '@playwright/test/reporter';
import type { XTestSuite as XTestSuite, XAdapter } from 'x-feature-reporter';
export declare const embeddingPlaceholder = "playwright-feature-reporter";
export declare const ANNOTATION_TEST_TYPE = "test-type";
export declare const TEST_TYPE_BEHAVIOR = "behavior";
export declare const PLAYWRIGHT_SUITE_TYPE_DESCRIBE = "describe";
export declare const PLAYWRIGHT_SUITE_TYPE_PROJECT = "project";
export type { XAdapter, XTestSuite, XTestResult } from 'x-feature-reporter';
export interface ReporterOptions {
    outputFile?: string;
    fullReportLink?: string;
    reportProjects?: boolean;
    embeddingPlaceholder?: string;
    adapter?: AdapterConstructor;
    adapterOptions?: Record<string, unknown>;
}
export type AdapterConstructor = new (options: Omit<ReporterOptions, 'adapter'>) => XAdapter;
declare class MyReporter implements Reporter {
    private options;
    private suite;
    constructor(options?: ReporterOptions);
    onBegin(config: FullConfig, suite: Suite): void;
    onTestBegin(test: TestCase, result: TestResult): void;
    onTestEnd(test: TestCase, result: TestResult): void;
    _outcomeToStatus(outcome: string): string;
    _convertSuiteToXFeatureReporter(s: Suite): XTestSuite;
    onEnd(result: FullResult): void;
}
export default MyReporter;
