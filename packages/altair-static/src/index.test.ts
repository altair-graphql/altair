import { readFileSync } from 'fs';
import { resolve } from 'path';
import { renderAltair, renderInitialOptions } from './index';
import * as getAltairHtml from './utils/get-altair-html';

const translateRenderedStrToObj = (result) => {
  const resultObj = Function(`
  let __options;
  const AltairGraphQL = { init: (options) => { __options = options; } };
  ${result}
  return __options;`)();

  return resultObj;
};

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
    
    expect(translateRenderedStrToObj(result)).toEqual({
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
  it('should render boolean values correctly', () => {
    const result = renderInitialOptions({
      preserveState: false,
    });

    expect(translateRenderedStrToObj(result)).toEqual({
      preserveState: false,
    })
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
