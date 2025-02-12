import { GraphQLRequest } from '../../types';

export const mockRequests: GraphQLRequest[] = [
  {
    id: '1',
    name: 'main.js',
    method: 'GET',
    status: 200,
    contentType: 'application/json',
    size: 45300,
    time: 145,
    url: 'https://api.example.com/graphql',
    queryType: 'query',
    requestHeaders: {
      'X-GraphQL-Token': 'asd7-237s-' + Math.random(),
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': '*',
    },
    requestContent: [
      {
        selectedOperationName: 'Hello',
        operationNames: ['Hello', 'UnreadNotificationCount'],
        query: `query Hello {\n  hello\n}`,
        queryRaw: `
        query Hello {
          hello
        }
        `,
        variables: {
          abc: 'def',
        },
      },
      {
        selectedOperationName: 'Hello',
        operationNames: ['Hello', 'UnreadNotificationCount'],
        query: `query UnreadNotificationCount {
  notificationStatus {
    unreadNotificationCount
    __typename
  }
}`,
        queryRaw: `
        query UnreadNotificationCount {
          notificationStatus {
            unreadNotificationCount
            __typename
          }
        }
        `,
        variables: {},
      },
    ],
    responseContent: `
    {
      "data": {
        "hello": "world"
      }
    }`,
  },
  {
    id: '2',
    name: 'main.css',
    method: 'GET',
    status: 200,
    contentType: 'text/css',
    size: 12300,
    time: 45,
    url: 'https://api.example.com/graphql',
    queryType: 'mutation',
    requestHeaders: {
      'X-GraphQL-Token': 'asd7-237s-' + Math.random(),
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': '*',
    },
    requestContent: [],
  },
  {
    id: '3',
    name: 'favicon.ico',
    method: 'GET',
    status: 200,
    contentType: 'image/x-icon',
    size: 2300,
    time: 12,
    url: 'https://api.example.com/graphql',
    queryType: 'subscription',
    requestHeaders: {
      'X-GraphQL-Token': 'asd7-237s-' + Math.random(),
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': '*',
    },
    requestContent: [],
  },
  {
    id: '4',
    name: 'logo.png',
    method: 'GET',
    status: 200,
    contentType: 'image/png',
    size: 2300,
    time: 12,
    url: 'https://api.example.com/graphql',
    queryType: 'query',
    requestHeaders: {
      'X-GraphQL-Token': 'asd7-237s-' + Math.random(),
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': '*',
    },
    requestContent: [],
  },
  {
    id: '5',
    name: 'logo.svg',
    method: 'GET',
    status: 200,
    contentType: 'image/svg+xml',
    size: 2300,
    time: 12,
    url: 'https://api.example.com/graphql',
    queryType: 'query',
    requestHeaders: {
      'X-GraphQL-Token': 'asd7-237s-' + Math.random(),
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': '*',
    },
    requestContent: [],
  },
  {
    id: '6',
    name: 'logo.jpg',
    method: 'GET',
    status: 200,
    contentType: 'image/jpeg',
    size: 2300,
    time: 12,
    url: 'https://api.example.com/graphql',
    queryType: 'query',
    requestHeaders: {
      'X-GraphQL-Token': 'asd7-237s-' + Math.random(),
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': '*',
    },
    requestContent: [],
  },
  {
    id: '7',
    name: 'logo.gif',
    method: 'GET',
    status: 200,
    contentType: 'image/gif',
    size: 2300,
    time: 12,
    url: 'https://api.example.com/graphql',
    queryType: 'query',
    requestHeaders: {
      'X-GraphQL-Token': 'asd7-237s-' + Math.random(),
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': '*',
    },
    requestContent: [],
  },
  {
    id: '8',
    name: 'logo.webp',
    method: 'GET',
    status: 200,
    contentType: 'image/webp',
    size: 2300,
    time: 12,
    url: 'https://api.example.com/graphql',
    queryType: 'query',
    requestHeaders: {
      'X-GraphQL-Token': 'asd7-237s-' + Math.random(),
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': '*',
    },
    requestContent: [],
  },
  {
    id: '9',
    name: 'logo.bmp',
    method: 'GET',
    status: 200,
    contentType: 'image/bmp',
    size: 2300,
    time: 12,
    url: 'https://api.example.com/graphql',
    queryType: 'mutation',
    requestHeaders: {
      'X-GraphQL-Token': 'asd7-237s-' + Math.random(),
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': '*',
    },
    requestContent: [],
  },
  {
    id: '10',
    name: 'logo.tiff',
    method: 'GET',
    status: 200,
    contentType: 'image/tiff',
    size: 2300,
    time: 12,
    url: 'https://api.example.com/graphql',
    queryType: 'query',
    requestHeaders: {
      'X-GraphQL-Token': 'asd7-237s-' + Math.random(),
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': '*',
    },
    requestContent: [],
  },
];
