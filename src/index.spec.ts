import { test, expect } from '@playwright/test';
import type { Suite, TestCase, TestResult } from '@playwright/test/reporter';
import MyReporter, { embeddingPlaceholder, 
  ANNOTATION_TEST_TYPE, TEST_TYPE_BEHAVIOR, 
  PLAYWRIGHT_SUITE_TYPE_DESCRIBE, 
  PLAYWRIGHT_SUITE_TYPE_PROJECT} from './index.ts';
import sinon from 'sinon';
import fs from 'fs';
import { TEST_PREFIX_PASSED, TEST_PREFIX_FAILED, TEST_PREFIX_SKIPPED, XAdapter } from 'x-feature-reporter/adapters/markdown';

// Mock adapter class for testing
class MockAdapter implements XAdapter {
  generateReport(suite: any): void {}
}

let reporter: MyReporter;
let mockDescribeBlock: Suite;
let mockDescribeBlock2: Suite;
let mockTestCase: TestCase;
let mockTestCase2: TestCase;
let mockTestResult: TestResult;
const featureTitle = 'Feature title';
const caseTitle = 'case title';
const caseTitle2 = 'case 2 title';
const subfeatureTitle = 'Subfeature title';
const outputFile = 'test-output.md';
let writeFileSyncStub: sinon.SinonStub;
const embeddingPlaceholderStart = `<!-- ${embeddingPlaceholder}--start -->`;
const embeddingPlaceholderEnd = `<!-- ${embeddingPlaceholder}--end -->`;

test.beforeEach(() => {
  writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
  writeFileSyncStub.returns(undefined);
  reporter = new MyReporter({ outputFile });
  mockDescribeBlock = {
    type: PLAYWRIGHT_SUITE_TYPE_DESCRIBE,
    title: featureTitle,
    tests: [],
    suites: [],
  } as unknown as Suite;
  mockDescribeBlock2 = {
    type: PLAYWRIGHT_SUITE_TYPE_DESCRIBE,
    title: subfeatureTitle,
    tests: [],
    suites: [],
  } as unknown as Suite;
  mockTestCase = {
    title: caseTitle,
    outcome: sinon.stub().returns('expected'),
  } as unknown as TestCase;
  mockTestCase2 = {
    title: caseTitle2,
    outcome: sinon.stub().returns('expected'),
  } as unknown as TestCase;
  mockTestResult = {} as TestResult;
});

test.describe("Features", () => {
  test.afterEach(() => {
    sinon.restore();
  });
  
  test.describe('Markdown generation', () => {
    test("By default, multiple project don't create duplicate entries. Their features are merged", () => {
      const project1 = {
        type: PLAYWRIGHT_SUITE_TYPE_PROJECT,
        title: 'project1',
        suites: [mockDescribeBlock, mockDescribeBlock2],
        tests: [],
      } as unknown as Suite;
      const project2 = {
        type: PLAYWRIGHT_SUITE_TYPE_PROJECT,
        title: 'project2',
        suites: [mockDescribeBlock2],
        tests: [],
      } as unknown as Suite;
      const rootSuite = {
        type: 'root',
        suites: [project1, project2],
        tests: [],
      } as unknown as Suite;
      mockDescribeBlock.tests.push(mockTestCase);
      mockDescribeBlock2.tests.push(mockTestCase2);
      reporter.onBegin({} as any, rootSuite);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n## ${subfeatureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    
    test("Describe blocks appear as headings. Nested describe blocks are nested headings", () => {
      mockDescribeBlock.suites.push(mockDescribeBlock2);
      mockDescribeBlock2.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockDescribeBlock);
      reporter.onEnd({} as any);
      
      const expectedMarkdown = `\n## ${featureTitle}\n### ${subfeatureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    
    test(`Tests appear as list items representing features. Each feature is visually marked as Passing ${TEST_PREFIX_PASSED}, Failing ${TEST_PREFIX_FAILED} or Skipped ${TEST_PREFIX_SKIPPED}`, () => {
      mockTestCase.outcome = sinon.stub().returns('unexpected');
      mockTestCase2.outcome = sinon.stub().returns('skipped');  
      mockDescribeBlock.tests.push(mockTestCase);
      mockDescribeBlock.tests.push(mockTestCase2);
      reporter.onBegin({} as any, mockDescribeBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_FAILED} ${caseTitle}\n - ${TEST_PREFIX_SKIPPED} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    
    test('Flaky tests display failed emoji', 
      {annotation: [{type: 'test-type', description: 'regression'}]}, () => {
        mockTestCase.outcome = sinon.stub().returns('flaky');
        mockDescribeBlock.tests.push(mockTestCase);
        reporter.onBegin({} as any, mockDescribeBlock);
        reporter.onEnd({} as any);
        const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_FAILED} ${caseTitle}\n`;
        const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
        expect(actualMarkdown).toBe(expectedMarkdown);
      });
      
    test("Tests can be annotated with test-types. Behavioral tests appear as features. Unannotated tests are assumed to be behavioral.", () => {
      const compatibilityType = 'compatibility';
      const behavioralType = TEST_TYPE_BEHAVIOR;
      const compatibilityTest = mockTestCase;
      const behavioralTest = mockTestCase2; 
      compatibilityTest.annotations = [{type: ANNOTATION_TEST_TYPE, description: compatibilityType}]
      behavioralTest.annotations = [{type: ANNOTATION_TEST_TYPE, description: behavioralType}]
      mockDescribeBlock.tests.push(compatibilityTest);
      mockDescribeBlock.tests.push(behavioralTest);
      reporter.onBegin({} as any, mockDescribeBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${behavioralTest.title}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    
    test("- Describe blocks containing only non-behavioral tests are not shown in the report", () => {
      // describe block annotation is basically the same as a block whose all children have the same annotation
      const compatibilityType = 'compatibility';
      const compatibilityTest1 = mockTestCase;
      const compatibilityTest2 = mockTestCase2; 
      compatibilityTest1.annotations = [{type: ANNOTATION_TEST_TYPE, description: compatibilityType}]
      compatibilityTest2.annotations = [{type: ANNOTATION_TEST_TYPE, description: compatibilityType}]
      mockDescribeBlock.tests.push(compatibilityTest1);
      mockDescribeBlock.tests.push(compatibilityTest2);
      reporter.onBegin({} as any, mockDescribeBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    
    test("Embed the report in an existing file between placeholders", () => {
      const initialContent = "This is static content in the header";
      const additionalContent = "this is additional content in the footer";
      const oldContent = "this is old generated content";
      mockDescribeBlock.tests.push(mockTestCase);
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(fs, 'readFileSync').returns(initialContent+embeddingPlaceholderStart+oldContent+embeddingPlaceholderEnd+additionalContent);
      reporter.onBegin({} as any, mockDescribeBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n`;
      const expectedContent = initialContent + embeddingPlaceholderStart + expectedMarkdown + embeddingPlaceholderEnd + additionalContent;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedContent);
    });
    
    test("- Omit the closing placeholder if it's the last content in the file", () => {
      const initialContent = "This is static content";
      const oldContent = "this is old generated content";
      mockDescribeBlock.tests.push(mockTestCase);
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(fs, 'readFileSync').returns(initialContent+embeddingPlaceholderStart+oldContent+embeddingPlaceholderEnd);
      reporter.onBegin({} as any, mockDescribeBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n`;
      const expectedContent = initialContent + embeddingPlaceholderStart + expectedMarkdown + embeddingPlaceholderEnd;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedContent);
    });
    
    test("Same headings from across suites are shown only once", () => {
      const featureTitle2 = featureTitle
      const mockSuite2 = {
        type: PLAYWRIGHT_SUITE_TYPE_DESCRIBE,
        title: featureTitle2,
        tests: [],
        suites: [],
      } as unknown as Suite;
      mockDescribeBlock.tests.push(mockTestCase);
      mockSuite2.tests.push(mockTestCase2);
      const parentSuite = {
        type: 'root',
        tests: [],
        suites: [mockDescribeBlock, mockSuite2],
      } as unknown as Suite;
      reporter.onBegin({} as any, parentSuite);
      reporter.onEnd({} as any);
      
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    
    test("Features can nest under other features", () => {
      mockTestCase2.title = `- ${caseTitle2}`;
      mockDescribeBlock.tests.push(mockTestCase);
      mockDescribeBlock.tests.push(mockTestCase2);
      reporter.onBegin({} as any, mockDescribeBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    
    test("- Features can nest multiple levels deep", () => {
      mockTestCase2.title = `-- ${caseTitle2}`;
      mockDescribeBlock.tests.push(mockTestCase);
      mockDescribeBlock.tests.push(mockTestCase2);
      reporter.onBegin({} as any, mockDescribeBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
  });
  
test.describe("Configuration", () => {
    test.only("outputFormat can be set to 'json'", () => {
      reporter = new MyReporter({ 
        outputFile, 
        outputFormat: 'json',
      });
      mockDescribeBlock.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockDescribeBlock);
      reporter.onEnd({} as any);
      
      const actualJson = writeFileSyncStub.getCall(0)?.args[1];
      const expectedJson = [{"title":mockDescribeBlock.title,"transparent":false,"suites":[],"tests":[{"title":mockTestCase.title,"status":"passed"}]}]
      expect(actualJson).toBe(JSON.stringify(expectedJson));
    });

    test("A link to a full test report will be included when the 'fullReportLink' option is provided", () => {
      const fullReportLink = 'full-report.html';
      reporter = new MyReporter({ outputFile, fullReportLink });
      mockDescribeBlock.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockDescribeBlock);
      reporter.onEnd({} as any);
      const expectedLink = `[Test report](${fullReportLink})`;
      const expectedMarkdown = `\n## ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n\n${expectedLink}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });

    test("Projects are reported separately as headers when the option 'reportProjects' is true", () => {
      reporter = new MyReporter({ outputFile, reportProjects: true });
      const projectTitle1 = 'project1';
      const projectTitle2 = 'project2';
      const project1 = {
        type: PLAYWRIGHT_SUITE_TYPE_PROJECT,
        title: projectTitle1,
        suites: [mockDescribeBlock, mockDescribeBlock2],
        tests: [],
      } as unknown as Suite;
      const project2 = {
        type: PLAYWRIGHT_SUITE_TYPE_PROJECT,
        title: projectTitle2,
        suites: [mockDescribeBlock2],
        tests: [],
      } as unknown as Suite;
      const rootSuite = {
        type: 'root',
        suites: [project1, project2],
        tests: [],
      } as unknown as Suite;
      mockDescribeBlock.tests.push(mockTestCase);
      mockDescribeBlock2.tests.push(mockTestCase2);
      reporter.onBegin({} as any, rootSuite);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${projectTitle1}\n### ${featureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle}\n### ${subfeatureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n## ${projectTitle2}\n### ${subfeatureTitle}\n - ${TEST_PREFIX_PASSED} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
  });
});
    