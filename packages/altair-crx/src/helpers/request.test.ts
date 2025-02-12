import { getOperationNames, parseGraphqlRequest, getRequest } from './request';
import { describe, it, expect, vitest } from 'vitest';

describe('request helpers', () => {
  describe('getOperationNames', () => {
    it('should return operation names from a valid query', () => {
      const query = `
        query GetUser {
          user {
            id
            name
          }
        }
        mutation UpdateUser {
          updateUser(id: 1, name: "New Name") {
            id
            name
          }
        }
      `;
      const operationNames = getOperationNames(query);
      expect(operationNames).toEqual(['GetUser', 'UpdateUser']);
    });

    it('should return an empty array for a query with no operation names', () => {
      const query = `
        {
          user {
            id
            name
          }
        }
      `;
      const operationNames = getOperationNames(query);
      expect(operationNames).toEqual([]);
    });

    it('should return an empty array for an invalid query', () => {
      const query = `invalid query`;
      const operationNames = getOperationNames(query);
      expect(operationNames).toEqual([]);
    });
  });

  describe('parseGraphqlRequest', () => {
    it('should parse a valid GraphQL request', () => {
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          postData: { text: '{"query": "{ user { id name } }"}' },
          method: 'POST',
          queryString: [],
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
        },
      };
      const parsedRequest = parseGraphqlRequest(request as any);
      expect(parsedRequest).toEqual({ query: '{ user { id name } }' });
    });

    it('should return undefined for a request with invalid content type', () => {
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'text/html' }],
          postData: { text: '{"query": "{ user { id name } }"}' },
          method: 'POST',
          queryString: [],
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
        },
      };
      const parsedRequest = parseGraphqlRequest(request as any);
      expect(parsedRequest).toBeUndefined();
    });

    it('should parse a valid GraphQL GET request', () => {
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          method: 'GET',
          queryString: [{ name: 'query', value: '{ user { id name } }' }],
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
        },
      };
      const parsedRequest = parseGraphqlRequest(request as any);
      expect(parsedRequest).toEqual({ query: '{ user { id name } }' });
    });

    it('should return undefined for a request with invalid JSON', () => {
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          postData: { text: 'invalid json' },
          method: 'POST',
          queryString: [],
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
        },
      };
      const parsedRequest = parseGraphqlRequest(request as any);
      expect(parsedRequest).toBeUndefined();
    });

    it('should parse a valid GraphQL request with operationName and variables', () => {
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          postData: {
            text: '{"query": "{ user { id name } }", "operationName": "GetUser", "variables": {"id": 1}}',
          },
          method: 'POST',
          queryString: [],
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
        },
      };
      const parsedRequest = parseGraphqlRequest(request as any);
      expect(parsedRequest).toEqual({
        query: '{ user { id name } }',
        operationName: 'GetUser',
        variables: { id: 1 },
      });
    });

    it('should parse a valid GraphQL GET request with operationName and variables', () => {
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          method: 'GET',
          queryString: [
            { name: 'query', value: '{ user { id name } }' },
            { name: 'operationName', value: 'GetUser' },
            { name: 'variables', value: '{"id": 1}' },
          ],
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
        },
      };
      const parsedRequest = parseGraphqlRequest(request as any);
      expect(parsedRequest).toEqual({
        query: '{ user { id name } }',
        operationName: 'GetUser',
        variables: { id: 1 },
      });
    });

    it('should return undefined for a request with invalid variables JSON', () => {
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          postData: {
            text: '{"query": "{ user { id name } }", "variables": "invalid json"}',
          },
          method: 'POST',
          queryString: [],
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
        },
      };
      const parsedRequest = parseGraphqlRequest(request as any);
      expect(parsedRequest).toEqual({
        query: '{ user { id name } }',
        variables: 'invalid json',
      });
    });
  });

  describe('getRequest', () => {
    it('should return a valid request object for a valid GraphQL request', async () => {
      const responseContent = {
        content: '{"data": {"user": {"id": 1, "name": "John Doe"}}}',
        encoding: 'utf-8',
      };
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          postData: { text: '{"query": "{ user { id name } }"}' },
          method: 'POST',
          queryString: [],
          url: 'http://example.com/graphql',
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          content: { mimeType: 'application/json', size: 123 },
          status: 200,
        },
        startedDateTime: '2023-10-01T12:00:00Z',
        time: 100,
        getContent: vitest.fn((callback) => {
          callback(responseContent.content, responseContent.encoding);
        }),
      };
      const result = await getRequest(request as any);
      expect(result).toEqual({
        id: '2023-10-01T12:00:00Zhttp://example.com/graphql200100',
        name: 'Unknown',
        method: 'POST',
        status: 200,
        contentType: 'application/json',
        size: 123,
        time: 100,
        url: 'http://example.com/graphql',
        queryType: 'query',
        requestHeaders: { 'content-type': 'application/json' },
        responseHeaders: { 'content-type': 'application/json' },
        requestContent: [
          {
            selectedOperationName: undefined,
            operationNames: [],
            queryRaw: '{ user { id name } }',
            query: '{\n  user {\n    id\n    name\n  }\n}\n',
            variables: undefined,
          },
        ],
        responseContent: '{"data": {"user": {"id": 1, "name": "John Doe"}}}',
      });
    });

    it('should return undefined for an invalid GraphQL request', async () => {
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          postData: { text: 'invalid json' },
          method: 'POST',
          queryString: [],
          url: 'http://example.com/graphql',
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          content: { mimeType: 'application/json', size: 123 },
          status: 200,
        },
        startedDateTime: '2023-10-01T12:00:00Z',
        time: 100,
      };
      const result = await getRequest(request as any);
      expect(result).toBeUndefined();
    });

    it('should return a valid request object for a valid GraphQL GET request', async () => {
      const responseContent = {
        content: '{"data": {"user": {"id": 1, "name": "John Doe"}}}',
        encoding: 'utf-8',
      };
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          method: 'GET',
          queryString: [{ name: 'query', value: '{ user { id name } }' }],
          url: 'http://example.com/graphql',
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          content: { mimeType: 'application/json', size: 123 },
          status: 200,
        },
        startedDateTime: '2023-10-01T12:00:00Z',
        time: 100,
        getContent: vitest.fn((callback) => {
          callback(responseContent.content, responseContent.encoding);
        }),
      };
      const result = await getRequest(request as any);
      expect(result).toEqual({
        id: '2023-10-01T12:00:00Zhttp://example.com/graphql200100',
        name: 'Unknown',
        method: 'GET',
        status: 200,
        contentType: 'application/json',
        size: 123,
        time: 100,
        url: 'http://example.com/graphql',
        queryType: 'query',
        requestHeaders: { 'content-type': 'application/json' },
        responseHeaders: { 'content-type': 'application/json' },
        requestContent: [
          {
            selectedOperationName: undefined,
            operationNames: [],
            queryRaw: '{ user { id name } }',
            query: '{\n  user {\n    id\n    name\n  }\n}\n',
            variables: undefined,
          },
        ],
        responseContent: '{"data": {"user": {"id": 1, "name": "John Doe"}}}',
      });
    });

    it('should return a valid request object for multiple GraphQL requests', async () => {
      const responseContent = {
        content: '{"data": {"user": {"id": 1, "name": "John Doe"}}}',
        encoding: 'utf-8',
      };
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          postData: {
            text: JSON.stringify([
              { query: '{ user { id name } }' },
              { query: '{ post { id title } }' },
            ]),
          },
          method: 'POST',
          queryString: [],
          url: 'http://example.com/graphql',
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          content: { mimeType: 'application/json', size: 123 },
          status: 200,
        },
        startedDateTime: '2023-10-01T12:00:00Z',
        time: 100,
        getContent: vitest.fn((callback) => {
          callback(responseContent.content, responseContent.encoding);
        }),
      };
      const result = await getRequest(request as any);
      expect(result).toEqual({
        id: '2023-10-01T12:00:00Zhttp://example.com/graphql200100',
        name: 'Unknown + 1 more',
        method: 'POST',
        status: 200,
        contentType: 'application/json',
        size: 123,
        time: 100,
        url: 'http://example.com/graphql',
        queryType: 'query',
        requestHeaders: { 'content-type': 'application/json' },
        responseHeaders: { 'content-type': 'application/json' },
        requestContent: [
          {
            selectedOperationName: undefined,
            operationNames: [],
            queryRaw: '{ user { id name } }',
            query: '{\n  user {\n    id\n    name\n  }\n}\n',
            variables: undefined,
          },
          {
            selectedOperationName: undefined,
            operationNames: [],
            queryRaw: '{ post { id title } }',
            query: '{\n  post {\n    id\n    title\n  }\n}\n',
            variables: undefined,
          },
        ],
        responseContent: '{"data": {"user": {"id": 1, "name": "John Doe"}}}',
      });
    });

    it('should return a valid request object for multiple GraphQL requests with operation names', async () => {
      const responseContent = {
        content: '{"data": {"user": {"id": 1, "name": "John Doe"}}}',
        encoding: 'utf-8',
      };
      const request = {
        request: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          postData: {
            text: JSON.stringify([
              { query: '{ user { id name } }', operationName: 'GetUser' },
              {
                query: 'query GetPost { post { id title } }',
                operationName: 'GetPost',
              },
            ]),
          },
          method: 'POST',
          queryString: [],
          url: 'http://example.com/graphql',
        },
        response: {
          headers: [{ name: 'content-type', value: 'application/json' }],
          content: { mimeType: 'application/json', size: 123 },
          status: 200,
        },
        startedDateTime: '2023-10-01T12:00:00Z',
        time: 100,
        getContent: vitest.fn((callback) => {
          callback(responseContent.content, responseContent.encoding);
        }),
      };
      const result = await getRequest(request as any);
      expect(result).toEqual({
        id: '2023-10-01T12:00:00Zhttp://example.com/graphql200100',
        name: 'GetUser + 1 more',
        method: 'POST',
        status: 200,
        contentType: 'application/json',
        size: 123,
        time: 100,
        url: 'http://example.com/graphql',
        queryType: 'query',
        requestHeaders: { 'content-type': 'application/json' },
        responseHeaders: { 'content-type': 'application/json' },
        requestContent: [
          {
            selectedOperationName: 'GetUser',
            operationNames: [],
            queryRaw: '{ user { id name } }',
            query: '{\n  user {\n    id\n    name\n  }\n}\n',
            variables: undefined,
          },
          {
            selectedOperationName: 'GetPost',
            operationNames: ['GetPost'],
            queryRaw: 'query GetPost { post { id title } }',
            query: 'query GetPost {\n  post {\n    id\n    title\n  }\n}\n',
            variables: undefined,
          },
        ],
        responseContent: '{"data": {"user": {"id": 1, "name": "John Doe"}}}',
      });
    });
  });
});
