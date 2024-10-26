import { XFeatureReporter } from 'x-feature-reporter';
let _suite;
let _outputFile;
let _fullReportLink;
export const embeddingPlaceholder = "<!-- playwright-feature-reporter--start -->";
export const embeddingPlaceholderEnd = "<!-- playwright-feature-reporter--end -->";
export const ANNOTATION_TEST_TYPE = 'test-type';
export const TEST_TYPE_BEHAVIOR = 'behavior';
export const PLAYWRIGHT_SUITE_TYPE_DESCRIBE = 'describe';
// TODO: Add some test that uses this type
export const PLAYWRIGHT_SUITE_TYPE_PROJECT = 'project';
class MyReporter {
    constructor(options = {}) {
        _outputFile = options.outputFile || 'FEATURES.md';
        _fullReportLink = options.fullReportLink;
        this.reporter = new XFeatureReporter();
    }
    onBegin(config, suite) {
        _suite = suite;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTestBegin(test, result) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTestEnd(test, result) {
    }
    _outcomeToStatus(outcome) {
        switch (outcome) {
            case 'skipped': return 'skipped';
            case 'expected': return 'passed';
            case 'unexpected': return 'failed';
        }
        return outcome;
    }
    _convertSuiteToXFeatureReporter(s) {
        const xSuite = {
            title: s.title,
            transparent: s.type !== PLAYWRIGHT_SUITE_TYPE_DESCRIBE,
            suites: [],
            tests: [],
        };
        xSuite.suites = s.suites.map((ss) => this._convertSuiteToXFeatureReporter(ss));
        xSuite.tests = s.tests.map((t) => {
            var _a, _b;
            return {
                title: t.title,
                status: this._outcomeToStatus(t.outcome()),
                testType: (_b = (_a = t.annotations) === null || _a === void 0 ? void 0 : _a.find((a) => a.type === ANNOTATION_TEST_TYPE)) === null || _b === void 0 ? void 0 : _b.description,
            };
        });
        return xSuite;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onEnd(result) {
        const suite = this._convertSuiteToXFeatureReporter(_suite);
        this.reporter.generateReport(_outputFile, suite, _fullReportLink);
    }
}
export default MyReporter;
