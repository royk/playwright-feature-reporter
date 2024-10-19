import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
export declare const embeddingPlaceholder = "<!-- playwright-feature-reporter--start -->";
export declare const embeddingPlaceholderEnd = "<!-- playwright-feature-reporter--end -->";
export declare const oldPlaceholderStart = "<!-- jest-playwright-feature-reporter--placeholder -->";
export declare const oldPlaceholderEnd = "<!-- jest-playwright-feature-reporter--placeholder-end -->";
export declare const ANNOTATION_TEST_TYPE = "test-type";
export declare const ANNOTATION_COMMENT = "comment";
export declare const TEST_TYPE_BEHAVIOR = "behavior";
export declare const PLAYWRIGHT_SUITE_TYPE_DESCRIBE = "describe";
export declare const PLAYWRIGHT_SUITE_TYPE_PROJECT = "project";
declare class MyReporter implements Reporter {
    constructor(options?: {
        outputFile?: string;
        fullReportLink?: string;
    });
    onBegin(config: FullConfig, suite: Suite): void;
    onTestBegin(test: TestCase, result: TestResult): void;
    onTestEnd(test: TestCase, result: TestResult): void;
    onEnd(result: FullResult): void;
}
export default MyReporter;
