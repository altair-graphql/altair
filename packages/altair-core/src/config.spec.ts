import { describe, expect, it } from '@jest/globals';
import { AltairConfig } from './config';

describe('config', () => {
  it('creates config object with expected properties', () => {
    const config = new AltairConfig();

    expect(config).toMatchSnapshot();
  });
});
