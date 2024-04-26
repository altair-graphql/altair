import { readFileSync } from 'fs';
import { resolve } from 'path';
import { renderAltair, renderInitialOptions } from './index';
import * as getAltairHtml from './get-altair-html';

const translateRenderedStrToObj = (result: string) => {
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
        'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4',
      },
      initialSettings: {
        theme: 'dark',
      },
      persistedSettings: {
        theme: 'light',
      },
    });

    expect(translateRenderedStrToObj(result)).toEqual({
      initialQuery: `query {
        Hello
      }`,
      endpointURL: 'https://example.com/graphql',
      initialHeaders: {
        'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4',
      },
      initialSettings: {
        theme: 'dark',
      },
      persistedSettings: {
        theme: 'light',
      },
    });

    expect(result).toMatchSnapshot();
  });
  it('should return expected string with $$', () => {
    const result = renderInitialOptions({
      baseURL: '/',
      initialQuery: `{
        MyDomains (
          page: {start: 1, limit: 1000}
          where: {AND: [{AND: [{myFilterA: {EQ: "$$"}} {myFilterB: {EQ: "2099-12-31T00:00:00Z"}}, {myFilterC: {EQ: "2024-04-23"}}]}]}
        ) {
          pages
          total
          select {
           myField1
           myField2     
          }
        }
      }`,
      endpointURL: 'https://example.com/graphql',
      initialHeaders: {
        'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4',
      },
      initialSettings: {
        theme: 'dark',
      },
      persistedSettings: {
        theme: 'light',
      },
    });

    expect(translateRenderedStrToObj(result)).toEqual({
      initialQuery: `{
        MyDomains (
          page: {start: 1, limit: 1000}
          where: {AND: [{AND: [{myFilterA: {EQ: "$$"}} {myFilterB: {EQ: "2099-12-31T00:00:00Z"}}, {myFilterC: {EQ: "2024-04-23"}}]}]}
        ) {
          pages
          total
          select {
           myField1
           myField2     
          }
        }
      }`,
      endpointURL: 'https://example.com/graphql',
      initialHeaders: {
        'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4',
      },
      initialSettings: {
        theme: 'dark',
      },
      persistedSettings: {
        theme: 'light',
      },
    });

    expect(result).toMatchSnapshot();
  });
  it('should render boolean values correctly', () => {
    const result = renderInitialOptions({
      preserveState: false,
    });

    expect(translateRenderedStrToObj(result)).toEqual({
      preserveState: false,
    });
  });
});

describe('renderAltair', () => {
  it('should return expected string', () => {
    (getAltairHtml as any).default = jest.fn();
    (getAltairHtml as any).default.mockReturnValue(
      readFileSync(resolve(__dirname, 'index.html'), 'utf8')
    );
    expect(
      renderAltair({
        baseURL: '/',
        initialQuery: `query {
        Hello
      }`,
        endpointURL: 'https://example.com/graphql',
        initialVariables: '{ variable: 1 }',
      })
    ).toMatchSnapshot();
  });
  it('should return expected string with $$', () => {
    (getAltairHtml as any).default = jest.fn();
    (getAltairHtml as any).default.mockReturnValue(
      readFileSync(resolve(__dirname, 'index.html'), 'utf8')
    );
    expect(
      renderAltair({
        baseURL: '/',
        initialQuery: `{
          MyDomains (
            page: {start: 1, limit: 1000}
            where: {AND: [{AND: [{myFilterA: {EQ: "$$"}} {myFilterB: {EQ: "2099-12-31T00:00:00Z"}}, {myFilterC: {EQ: "2024-04-23"}}]}]}
          ) {
            pages
            total
            select {
             myField1
             myField2     
            }
          }
        }`,
        endpointURL: 'https://example.com/graphql',
        initialVariables: '{ variable: 1 }',
      })
    ).toMatchSnapshot();
  });
});
