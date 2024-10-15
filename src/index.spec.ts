import { test, expect } from '@playwright/test';
import { Suite, TestCase, TestResult } from '@playwright/test/reporter';
import MyReporter, { embeddingPlaceholder, embeddingPlaceholderEnd } from './index.ts';
import sinon from 'sinon';
import fs from 'fs';
import { mock } from 'node:test';



test.describe("Features", () => {
  let reporter: MyReporter;
  let mockSuite: Suite;
  let mockSuite2: Suite;
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
    mockSuite = {
      type: 'describe',
      title: featureTitle,
      tests: [],
      suites: [],
    } as unknown as Suite;
    mockSuite2 = {
      type: 'describe',
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
      mockSuite.suites.push(mockSuite2);
      mockSuite2.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockSuite);
      reporter.onEnd({} as any);

      const expectedMarkdown = `\n## ${featureTitle}\n  ### ${subfeatureTitle}\n  - :white_check_mark: ${caseTitle}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Marks passing, failing and skipped tests", () => {
      mockTestCase.outcome = sinon.stub().returns('unexpected');
      mockTestCase2.outcome = sinon.stub().returns('skipped');  
      mockSuite.tests.push(mockTestCase);
      mockSuite.tests.push(mockTestCase2);
      reporter.onBegin({} as any, mockSuite);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- ${failingEmoji} ${caseTitle}\n- ${skippedEmoji} ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Supports comment annotations", () => {
      const description = 'This is a comment';
      mockTestCase.annotations = [{type: 'comment', description}]
      mockSuite.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockSuite);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- :white_check_mark: ${caseTitle} *(${description})*\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
    test("Supports embedding markdown in an existing file between placeholders", () => {
      const additionalContent = "This is some additional content.";
      const initialContent = `This is some existing content.\n${embeddingPlaceholder}`;
      const contentToDelete = "hello";
      mockSuite.tests.push(mockTestCase);
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(fs, 'readFileSync').returns(initialContent+contentToDelete+embeddingPlaceholderEnd+additionalContent);
      reporter.onBegin({} as any, mockSuite);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- :white_check_mark: ${caseTitle}\n`;
      const expectedContent = initialContent + expectedMarkdown + embeddingPlaceholderEnd + additionalContent;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedContent);
    });
    test("Supports embedding markdown in an existing file without closing placeholder", () => {
      const initialContent = `This is some existing content.\n${embeddingPlaceholder}`;
      const contentToDelete = "hello";
      mockSuite.tests.push(mockTestCase);
      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(fs, 'readFileSync').returns(initialContent+contentToDelete);
      reporter.onBegin({} as any, mockSuite);
      reporter.onEnd({} as any);
      const expectedMarkdown = `\n## ${featureTitle}\n- :white_check_mark: ${caseTitle}\n`;
      const expectedContent = initialContent + expectedMarkdown;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedContent);
    });
    test("Merges features from across suites", () => {
      const featureTitle2 = featureTitle
      const mockSuite2 = {
        type: 'describe',
        title: featureTitle2,
        tests: [],
        suites: [],
      } as unknown as Suite;
      mockSuite.tests.push(mockTestCase);
      mockSuite2.tests.push(mockTestCase2);
      const parentSuite = {
        type: 'root',
        tests: [],
        suites: [mockSuite, mockSuite2],
      } as unknown as Suite;
      reporter.onBegin({} as any, parentSuite);
      reporter.onEnd({} as any);

      const expectedMarkdown = `\n## ${featureTitle}\n- :white_check_mark: ${caseTitle}\n- :white_check_mark: ${caseTitle2}\n`;
      const actualMarkdown = writeFileSyncStub.getCall(0)?.args[1];
      expect(actualMarkdown).toBe(expectedMarkdown);
    });
  });
  test.describe("Configuration", () => {
    test("Define output file with 'outputFile' option", 
      {annotation: [{type: 'comment', description: 'Implicitly tested'}]}, () => {
    });
  });

});

test.describe("To do", () => {
  test.skip("Support annotation for test types (behavioral, edge cases, regression, etc)", () => {

  });
  test.skip("Supports embedding different test types in different parts of the document", () => {

  });
  test.skip("Display generation date", () => {

  });
  test.skip("Support for skipping a test from being reported", () => {

  });
  test.skip("Support for marking a describe block as skipped, and show all its children as skipped", () => {

  });
  test.skip("Support custom emojis", () => {

  });
});
