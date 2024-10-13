import fs from 'fs';
let _suite;
let _outputFile;
class MyReporter {
    constructor(options = {}) {
        _outputFile = options.outputFile || 'FEATURES.md';
    }
    onBegin(config, suite) {
        _suite = suite;
    }
    onTestBegin(test, result) {
    }
    onTestEnd(test, result) {
    }
    onEnd(result) {
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
        let nestedLevel = 0;
        let projectCount = 0;
        let stringBuilder = '';
        function suiteToJson(s) {
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
                };
            });
            return sJson;
        }
        function mergeSuites(s, suiteStructure) {
            if (s.type === 'describe' && suiteStructure[s.title]) {
                suiteStructure[s.title].tests.push(...s.tests);
                suiteStructure[s.title].suites.push(...s.suites);
                s.tests = [];
                s.suites = [];
            }
            else {
                suiteStructure[s.title] = s;
            }
            s.suites.forEach((ss) => {
                mergeSuites(ss, suiteStructure);
            });
            return s;
        }
        function printSuite(s) {
            const consolePrefix = '\t'.repeat(nestedLevel);
            const mdHeaderPrefix = '  '.repeat(nestedLevel) + '#'.repeat(nestedLevel + 2);
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
                if (nestedLevel === 0) {
                    stringBuilder += `${mdHeaderPrefix} ${s.title}\n`;
                }
                else {
                    stringBuilder += `${mdHeaderPrefix} ${s.title}\n`;
                }
                nestedLevel++;
            }
            s.tests.forEach((test) => {
                var _a, _b;
                const comment = (_b = (_a = test.annotations) === null || _a === void 0 ? void 0 : _a.find((a) => a.type === 'comment')) === null || _b === void 0 ? void 0 : _b.description;
                stringBuilder += `${mdListPrefix} ${getOutcome(test)} ${test.title}${comment ? ` *(${comment})*` : ''}\n`;
            });
            s.suites.forEach((ss) => {
                printSuite(ss);
            });
            if (s.type === 'describe') {
                nestedLevel--;
            }
        }
        console.log(suiteToJson(_suite));
        const mergedSuite = mergeSuites(suiteToJson(_suite), {});
        printSuite(mergedSuite);
        fs.writeFileSync(_outputFile, stringBuilder);
    }
}
export default MyReporter;
