import { describe, it, expect } from '@jest/globals';
import { buildTestHostComponentTemplate } from '../utils';

describe('utils', () => {
  describe('buildTestHostComponentTemplate', () => {
    it('should return expected template string', () => {
      const tmpl = buildTestHostComponentTemplate('my-main-component', {
        normalInputs: ['input1', 'input2'],
        signalInputs: ['disabled', 'collections'],
        availableInputs: ['input1', 'input2', 'disabled', 'collections'],
        outputs: ['saveChange', 'dialogChange', 'modelChange'],
      });

      expect(tmpl).toMatchSnapshot();
    });
  });
});
