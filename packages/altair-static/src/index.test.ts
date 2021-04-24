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
      endpointURL: 'https://example.com/graphql',
      initialHeaders: {
        'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
      },
      initialSettings: {
        theme: 'dark'
      }
    });
    const resultObj = Function(`
      let __options;
      const AltairGraphQL = { init: (options) => { __options = options; } };
      ${result}
      return __options;`)();
    expect(resultObj).toEqual({
      initialQuery: `query {
        Hello
      }`,
      endpointURL: 'https://example.com/graphql',
      initialHeaders: {
        'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
      },
      initialSettings: {
        theme: 'dark'
      }
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
