import { describe, expect, it } from 'vitest';
import { AltairConfig } from '.';

describe('config', () => {
  it('creates config object with expected properties', () => {
    const config = new AltairConfig();

    expect(config).toMatchSnapshot();
  });
});
