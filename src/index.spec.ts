import { test, expect } from '@playwright/test';
import { Suite, TestCase, TestResult } from '@playwright/test/reporter';
import MyReporter, { embeddingPlaceholder, embeddingPlaceholderEnd } from './index.ts';
import sinon from 'sinon';
import fs from 'fs';
import { mock } from 'node:test';

const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
writeFileSyncStub.returns(undefined);

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
  test.beforeEach(() => {
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
    });
    test("Supports comment annotations", () => {

    });
    test("Supports embedding markdown in an existing file", () => {

    });
  });
  test.describe("Configuration", () => {
    test("Define output file with 'outputFile' option", () => {

    });
  });

});

test.describe("To do", () => {
  test("Display generation date", () => {

  });
  test("Support for skipping a test from being reported", () => {

  });
});
