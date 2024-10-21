import { test, expect } from '@playwright/test';
import { Suite, TestCase, TestResult } from '@playwright/test/reporter';
import MyReporter, { embeddingPlaceholder, embeddingPlaceholderEnd, 
  oldPlaceholderStart, oldPlaceholderEnd,
  ANNOTATION_TEST_TYPE, ANNOTATION_COMMENT, TEST_TYPE_BEHAVIOR, 
  PLAYWRIGHT_SUITE_TYPE_DESCRIBE } from './index.ts';
import sinon from 'sinon';
import fs from 'fs';
import { mock } from 'node:test';

let reporter: MyReporter;
  let mockDescribBlock: Suite;
  let mockDescribeBlock2: Suite;
  let mockTestCase: TestCase;
  let mockTestCase2: TestCase;
  let mockTestResult: TestResult;
  const featureTitle = 'Feature title';
  const caseTitle = 'case title';
  const caseTitle2 = 'case 2 title';
  const subfeatureTitle = 'Subfeature title';
  const subfeatureTitle2 = 'Subfeature title 2';
  const outputFile = 'test-output.md';
  const passingEmoji = ':white_check_mark:';
  const failingEmoji = ':x:';
  const skippedEmoji = ':construction:';
  const flakyEmoji = ':warning:';
  let writeFileSyncStub: sinon.SinonStub;
  test.beforeEach(() => {
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
    writeFileSyncStub.returns(undefined);
    reporter = new MyReporter({ outputFile });
    mockDescribBlock = {
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
    test("Describe blocks appear as headings. Nested describe blocks are nested headings", () => {
      mockDescribBlock.suites.push(mockDescribeBlock2);
      mockDescribeBlock2.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);

      const expectedMarkdown = `\n## ${featureTitle}\n  ### ${subfeatureTitle}\n  - ${passingEmoji} ${caseTitle}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test(`Tests appear as list items representing features. Each feature is visually marked as Passing ${passingEmoji}, Failing ${failingEmoji} or Skipped ${skippedEmoji}`, () => {
      mockTestCase.outcome = sinon.stub().returns('unexpected');
      mockTestCase2.outcome = sinon.stub().returns('skipped');  
      mockDescribBlock.tests.push(mockTestCase);
      mockDescribBlock.tests.push(mockTestCase2);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${failingEmoji} ${caseTitle}\n- ${skippedEmoji} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Comment annotations appear as *(italics)* after the feature description", () => {
      const description = 'This is a comment';
      mockTestCase.annotations = [{type: ANNOTATION_COMMENT, description}]
      mockDescribBlock.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle} *(${description})*\n`;
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
      mockDescribBlock.tests.push(compatibilityTest);
      mockDescribBlock.tests.push(behavioralTest);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${behavioralTest.title}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Describe blocks containing only non-behavioral tests are not shown in the report", () => {
      // describe block annotation is basically the same as a block whose all children have the same annotation
      const compatibilityType = 'compatibility';
      const compatibilityTest1 = mockTestCase;
      const compatibilityTest2 = mockTestCase2; 
      compatibilityTest1.annotations = [{type: ANNOTATION_TEST_TYPE, description: compatibilityType}]
      compatibilityTest2.annotations = [{type: ANNOTATION_TEST_TYPE, description: compatibilityType}]
      mockDescribBlock.tests.push(compatibilityTest1);
      mockDescribBlock.tests.push(compatibilityTest2);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Embed the report in an existing file between placeholders", () => {
      const initialContent = "This is static content in the header";
      const additionalContent = "this is additional content in the footer";
      const oldContent = "this is old generated content";
      mockDescribBlock.tests.push(mockTestCase);
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(fs, 'readFileSync').returns(initialContent+embeddingPlaceholder+oldContent+embeddingPlaceholderEnd+additionalContent);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n`;
      const expectedContent = initialContent + embeddingPlaceholder + expectedMarkdown + embeddingPlaceholderEnd + additionalContent;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedContent);
    });
    test("Omit the closing placeholder if it's the last content in the file", () => {
      const initialContent = "This is static content";
      const oldContent = "this is old generated content";
      mockDescribBlock.tests.push(mockTestCase);
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(fs, 'readFileSync').returns(initialContent+embeddingPlaceholder+oldContent+embeddingPlaceholderEnd);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n`;
      const expectedContent = initialContent + embeddingPlaceholder + expectedMarkdown + embeddingPlaceholderEnd;
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
      mockDescribBlock.tests.push(mockTestCase);
      mockSuite2.tests.push(mockTestCase2);
      const parentSuite = {
        type: 'root',
        tests: [],
        suites: [mockDescribBlock, mockSuite2],
      } as unknown as Suite;
      reporter.onBegin({} as any, parentSuite);
      reporter.onEnd({} as any);

      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n- ${passingEmoji} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });

    test("- Support nesting features under other features", () => {
      mockTestCase2.title = `- ${caseTitle2}`;
      mockDescribBlock.tests.push(mockTestCase);
      mockDescribBlock.tests.push(mockTestCase2);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n  - ${passingEmoji} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test.skip("-- Support multiple levels of nesting", () => {
      mockTestCase2.title = `-- ${caseTitle2}`;
      mockDescribBlock.tests.push(mockTestCase);
      mockDescribBlock.tests.push(mockTestCase2);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n    - ${passingEmoji} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
  });
  test.describe("Configuration", () => {
    test("Define where to embed the report with 'outputFile' option", 
      {annotation: [{type: 'comment', description: 'Implicitly tested'}]}, () => {
    });
    test("A link to a full test report will be included when the 'fullReportLink' option is provided", () => {
      const fullReportLink = 'full-report.html';
      reporter = new MyReporter({ outputFile, fullReportLink });
      mockDescribBlock.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);
      const expectedLink = `[Test report](${fullReportLink})`;
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n\n${expectedLink}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
  });

 
    

});

test.describe("To do", () => {
  
  test.skip("Display generation date", () => {

  });
  test.skip("Support embedding different test types in different parts of the document", () => {

  });
  test.skip("Support custom emojis", () => {

  });
});

test.describe("Compatibility", {annotation: [{type: ANNOTATION_TEST_TYPE, description: 'compatibility'}]}, () => {
  test.afterEach(() => {
    sinon.restore();
  });
  test("Compatible with old placeholder tag", () => {
    const initialContent = "This is static content in the header";
    const additionalContent = "this is additional content in the footer";
    const oldContent = "this is old generated content";
    mockDescribBlock.tests.push(mockTestCase);
    sinon.stub(fs, 'existsSync').returns(true);
    sinon.stub(fs, 'readFileSync').returns(initialContent+oldPlaceholderStart+oldContent+oldPlaceholderEnd+additionalContent);
    reporter.onBegin({} as any, mockDescribBlock);
    reporter.onEnd({} as any);
    const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n`;
    const expectedContent = initialContent + oldPlaceholderStart + expectedMarkdown + oldPlaceholderEnd + additionalContent;
    const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
    expect(actualMarkdown).toBe(expectedContent);
  });
});

