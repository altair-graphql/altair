import { describe, it, expect } from '@jest/globals';
import { buildTestHostComponentTemplate } from '../utils';

describe('utils', () => {
  describe('buildTestHostComponentTemplate', () => {
    it('should return expected template string', () => {
      const tmpl = buildTestHostComponentTemplate(
        'my-main-component',
        ['disabled', 'input2', 'collections'],
        ['saveChange', 'dialogChange', 'modelChange']
      );

      expect(tmpl).toMatchSnapshot();
    });
  });
});
