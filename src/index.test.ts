import MyReporter, { embeddingPlaceholder } from './index.ts';
import { Suite, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';

jest.mock('fs');

describe('MyReporter', () => {
  let reporter: MyReporter;
  let mockSuite: Suite;
  let mockTestCase: TestCase;
  let mockTestCase2: TestCase;
  let mockTestResult: TestResult;
  const featureTitle = 'Feature title';
  const subfeatureTitle = 'Subfeature title';
  const subfeatureTitle2 = 'Subfeature title 2';
  const outputFile = 'test-output.md';

  beforeEach(() => {

    reporter = new MyReporter({ outputFile });
    mockSuite = {
      type: 'describe',
      title: featureTitle,
      tests: [],
      suites: [],
    } as unknown as Suite;
    mockTestCase = {
      title: subfeatureTitle,
      outcome: jest.fn().mockReturnValue('expected'),
    } as unknown as TestCase;
    mockTestCase2 = {
      title: subfeatureTitle2,
      outcome: jest.fn().mockReturnValue('expected'),
    } as unknown as TestCase;
    mockTestResult = {} as TestResult;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("markdown generation", () => {
    it('for a single feature with a single subfeature that passes', () => {
      mockSuite.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockSuite);
      reporter.onEnd({} as any);

      const expectedMarkdown = `## ${featureTitle}\n- :white_check_mark: ${subfeatureTitle}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith(outputFile, expectedMarkdown);
    });
    it('for a single feature with a single subfeature that fails', () => {
      mockTestCase.outcome = jest.fn().mockReturnValue('unexpected');
      mockSuite.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockSuite);
      reporter.onEnd({} as any);

      const expectedMarkdown = `## ${featureTitle}\n- :x: ${subfeatureTitle}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith(outputFile, expectedMarkdown);
    });
    it('supports multiple projects', () => {
      mockSuite.tests.push(mockTestCase);
      const suite = {
        title: '',
        type: 'root',
        suites: [{
          title: 'project1',
          suites: [mockSuite],
          tests: []
        },
        {
          title: 'project2',
          suites: [mockSuite],
          tests: []
        }
        ],
        tests: []
      } as unknown as Suite;
      reporter.onBegin({} as any, suite);
      reporter.onEnd({} as any);

      const expectedMarkdown = `## ${featureTitle}\n- :white_check_mark: ${subfeatureTitle}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith(outputFile, expectedMarkdown);
    });
    it('supports multiple suites', () => {
      const featureTitle2 = 'Feature 2';
      const mockSuite2 = {
        type: 'describe',
        title: featureTitle2,
        tests: [],
        suites: [],
      } as unknown as Suite;
      mockSuite.tests.push(mockTestCase);
      mockSuite2.tests.push(mockTestCase);
      const parentSuite = {
        type: 'root',
        tests: [],
        suites: [mockSuite, mockSuite2],
      } as unknown as Suite;
      reporter.onBegin({} as any, parentSuite);
      reporter.onEnd({} as any);

      const expectedMarkdown = `## ${featureTitle}\n- :white_check_mark: ${subfeatureTitle}\n## ${featureTitle2}\n- :white_check_mark: ${subfeatureTitle}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith(outputFile, expectedMarkdown);
    });
    it('merges suites with the same title', () => {
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

      const expectedMarkdown = `## ${featureTitle}\n- :white_check_mark: ${subfeatureTitle}\n- :white_check_mark: ${subfeatureTitle2}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith(outputFile, expectedMarkdown);
    });
    describe("annotations", () => {
      it("includes annotation of type 'comment' in the markdown", () => {
        const description = "This is a comment";
        mockTestCase.annotations = [{ type: 'comment', description }];
        mockSuite.tests.push(mockTestCase);
        reporter.onBegin({} as any, mockSuite);
        reporter.onEnd({} as any);

        const expectedMarkdown = `## ${featureTitle}\n- :white_check_mark: ${subfeatureTitle} *(${description})*\n`;
        expect(fs.writeFileSync).toHaveBeenCalledWith(outputFile, expectedMarkdown);
      });
    });
    describe("embedding in an existing file", () => {
      it("replaces a placeholder with the markdown", () => {
        const existingContent = `This is some existing content.\n`;
        mockSuite.tests.push(mockTestCase);
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.readFileSync = jest.fn().mockReturnValue(existingContent+embeddingPlaceholder);
        fs.writeFileSync = jest.fn();
        reporter.onBegin({} as any, mockSuite);
        reporter.onEnd({} as any);
        const expectedMarkdown = `## ${featureTitle}\n- :white_check_mark: ${subfeatureTitle}\n`;
        expect(fs.writeFileSync).toHaveBeenCalledWith(outputFile, existingContent + expectedMarkdown);
      });
    });
  });
});
