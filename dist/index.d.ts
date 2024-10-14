import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
export declare const embeddingPlaceholder = "<!-- jest-playwright-feature-reporter--placeholder -->";
export declare const embeddingPlaceholderEnd = "<!-- jest-playwright-feature-reporter--placeholder-end -->";
declare class MyReporter implements Reporter {
    constructor(options?: {
        outputFile?: string;
    });
    onBegin(config: FullConfig, suite: Suite): void;
    onTestBegin(test: TestCase, result: TestResult): void;
    onTestEnd(test: TestCase, result: TestResult): void;
    onEnd(result: FullResult): void;
}
export default MyReporter;
