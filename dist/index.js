import { MarkdownAdapter } from 'x-feature-reporter/adapters/markdown';
import { XFeatureReporter } from 'x-feature-reporter';
export const embeddingPlaceholder = 'playwright-feature-reporter';
export const ANNOTATION_TEST_TYPE = 'test-type';
export const TEST_TYPE_BEHAVIOR = 'behavior';
export const PLAYWRIGHT_SUITE_TYPE_DESCRIBE = 'describe';
export const PLAYWRIGHT_SUITE_TYPE_PROJECT = 'project';
class MyReporter {
    constructor(options = {}) {
        var _a;
        this.options = Object.assign(Object.assign({}, options), { reportProjects: (_a = options.reportProjects) !== null && _a !== void 0 ? _a : false });
    }
    onBegin(config, suite) {
        this.suite = suite;
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
            case 'flaky': return 'failed';
        }
        return outcome;
    }
    _convertSuiteToXFeatureReporter(s) {
        // only describe blocks are visible by default. Projects are visible only when the option 'reportProjects' is true.
        const visible = (s.type === PLAYWRIGHT_SUITE_TYPE_DESCRIBE ||
            (s.type === PLAYWRIGHT_SUITE_TYPE_PROJECT && this.options.reportProjects == true));
        // if projects are not reported, clear their titles so that their children share the same ancestry path (causes merging)
        const title = this.options.reportProjects == false && s.type === PLAYWRIGHT_SUITE_TYPE_PROJECT ? '' : s.title;
        const xSuite = {
            title,
            transparent: !visible,
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
        var _a;
        const xsuite = this._convertSuiteToXFeatureReporter(this.suite);
        let adapter;
        this.options.embeddingPlaceholder = (_a = this.options.embeddingPlaceholder) !== null && _a !== void 0 ? _a : embeddingPlaceholder;
        if (!this.options.adapter) {
            // Use default MarkdownAdapter if no adapter is provided
            adapter = new MarkdownAdapter({
                outputFile: this.options.outputFile,
                fullReportLink: this.options.fullReportLink,
                embeddingPlaceholder: this.options.embeddingPlaceholder
            });
        }
        else {
            // Instantiate the provided adapter with the adapterOptions
            adapter = new this.options.adapter(Object.assign(Object.assign({}, this.options), this.options.adapterOptions));
        }
        const reporter = new XFeatureReporter(adapter);
        reporter.generateReport(xsuite);
    }
}
export default MyReporter;
