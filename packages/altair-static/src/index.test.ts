import { readFileSync } from 'fs';
import { resolve } from 'path';
import { renderAltair, renderInitialOptions } from './index';
import * as getAltairHtml from './utils/get-altair-html';

describe('renderInitialOptions', () => {
  it('should return expected string', () => {
    const result = renderInitialOptions({
      baseURL: '/',
      initialQuery: `query {
        Hello
      }`,
      endpointURL: 'https://example.com/graphql'
    });
    expect(result).toMatchSnapshot();
  });
});

describe('renderAltair', () => {
  it('should return expected string', () => {
    (getAltairHtml as any).default = jest.fn();
    (getAltairHtml as any).default.mockReturnValue(readFileSync(resolve(__dirname, 'index.html'), 'utf8'));
    expect(renderAltair({
      baseURL: '/',
      initialQuery: `query {
        Hello
      }`,
      endpointURL: 'https://example.com/graphql',
      initialVariables: '{ variable: 1 }'
    })).toMatchSnapshot();
  });
});
