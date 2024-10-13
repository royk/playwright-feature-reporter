import MyReporter from './index.ts';
import { Suite, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';

jest.mock('fs');

describe('MyReporter', () => {
  let reporter: MyReporter;
  let mockSuite: Suite;
  let mockTestCase: TestCase;
  let mockTestResult: TestResult;
  const featureTitle = 'Feature title';
  const subfeatureTitle = 'Subfeature title';

  beforeEach(() => {
    reporter = new MyReporter({ outputFile: 'test-output.md' });
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
      expect(fs.writeFileSync).toHaveBeenCalledWith('test-output.md', expectedMarkdown);
    });
    it('for a single feature with a single subfeature that fails', () => {
      mockTestCase.outcome = jest.fn().mockReturnValue('unexpected');
      mockSuite.tests.push(mockTestCase);
      reporter.onBegin({} as any, mockSuite);
      reporter.onEnd({} as any);

      const expectedMarkdown = `## ${featureTitle}\n- :x: ${subfeatureTitle}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith('test-output.md', expectedMarkdown);
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
      expect(fs.writeFileSync).toHaveBeenCalledWith('test-output.md', expectedMarkdown);
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
      mockSuite2.tests.push(mockTestCase);
      const parentSuite = {
        type: 'root',
        tests: [],
        suites: [mockSuite, mockSuite2],
      } as unknown as Suite;
      reporter.onBegin({} as any, parentSuite);
      reporter.onEnd({} as any);

      const expectedMarkdown = `## ${featureTitle}\n- :white_check_mark: ${subfeatureTitle}\n- :white_check_mark: ${subfeatureTitle}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith('test-output.md', expectedMarkdown);
    });
    describe("annotations", () => {
      it("includes annotation of type 'comment' in the markdown", () => {
        const description = "This is a comment";
        mockTestCase.annotations = [{ type: 'comment', description }];
        mockSuite.tests.push(mockTestCase);
        reporter.onBegin({} as any, mockSuite);
        reporter.onEnd({} as any);

        const expectedMarkdown = `## ${featureTitle}\n- :white_check_mark: ${subfeatureTitle} *(${description})*\n`;
        expect(fs.writeFileSync).toHaveBeenCalledWith('test-output.md', expectedMarkdown);
      });
    });
  });
});
