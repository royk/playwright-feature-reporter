import { test, expect } from '@playwright/test';
import { Suite, TestCase, TestResult } from '@playwright/test/reporter';
import MyReporter, { embeddingPlaceholder, embeddingPlaceholderEnd, 
  oldPlaceholderStart, oldPlaceholderEnd,
  ANNOTATION_TEST_TYPE, ANNOTATION_COMMENT, TEST_TYPE_BEHAVIOR, 
  PLAYWRIGHT_SUITE_TYPE_DESCRIBE } from './index.ts';
import sinon from 'sinon';
import fs from 'fs';
import { mock } from 'node:test';



test.describe("Features", () => {
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
  test.afterEach(() => {
    sinon.restore();
  });
  test.describe('Markdown generation', () => {
    test("Supports nested describe blocks", () => {
      mockDescribBlock.suites.push(mockDescribeBlock2);
      mockDescribeBlock2.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);

      const expectedMarkdown = `\n## ${featureTitle}\n  ### ${subfeatureTitle}\n  - ${passingEmoji} ${caseTitle}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Marks passing, failing and skipped tests", () => {
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
    test("Supports comment annotations", () => {
      const description = 'This is a comment';
      mockTestCase.annotations = [{type: ANNOTATION_COMMENT, description}]
      mockDescribBlock.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockDescribBlock);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle} *(${description})*\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Supports test-type annotations, and doesn't report non-behavioral tests", () => {
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
    test("Supports embedding markdown in an existing file between placeholders", () => {
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
    test("Supports embedding markdown in an existing file without closing placeholder", () => {
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
    test("Merges features from across suites", () => {
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
  });
  test.describe("Configuration", () => {
    test("Define output file with 'outputFile' option", 
      {annotation: [{type: 'comment', description: 'Implicitly tested'}]}, () => {
    });
  });

  test("Compatible with old placeholder tag",
    {annotation: [{type: ANNOTATION_TEST_TYPE, description: 'compatibility'}]}, () => {
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

test.describe("To do", () => {
  test.skip("Supports embedding different test types in different parts of the document", () => {

  });
  test.skip("Display generation date", () => {

  });
  test.skip("Support for skipping a test from being reported", () => {

  });
  test.skip("Support for marking a describe block as skipped, and show all its children as skipped", () => {

  });
  test.skip("Supports marking a block with a test-type annotation and have its children inherit the annotation", () => {

  });
  test.skip("Support custom emojis", () => {

  });
  test.skip("Support including a link to a full test report", () => {

  });
});
