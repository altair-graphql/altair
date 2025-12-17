import { Kind, OperationDefinitionNode, parse } from 'graphql';
import { array, object, optional, string, union, unknown } from 'zod/v4';
import * as prettier from 'prettier/standalone';
import prettierGraphql from 'prettier/plugins/graphql';
import { parseJson } from './json';
import { RequestContent } from '../types';

const simpleGqlRequestSchema = object({
  operationName: optional(string()),
  query: string(),
  variables: optional(unknown()),
});
const gqlRequestSchema = union([
  simpleGqlRequestSchema,
  array(simpleGqlRequestSchema),
]);

interface Header {
  name: string;
  value: string;
  /**  A comment provided by the user or the application */
  comment?: string | undefined;
}

export const getOperationNames = (query: string): string[] => {
  try {
    const ast = parse(query);
    return ast.definitions
      .filter((def): def is OperationDefinitionNode =>
        def.kind === Kind.OPERATION_DEFINITION && def.name ? true : false
      )
      .map((def: OperationDefinitionNode) => def.name?.value)
      .filter((_): _ is string => !!_);
  } catch (e) {
    return [];
  }
};

const getContentType = (headers: Header[]) => {
  const contentTypeHeader = headers.find(
    (h) => h.name.toLowerCase() === 'content-type'
  );
  if (!contentTypeHeader) {
    return;
  }
  const [contentType] = contentTypeHeader.value.split(';');
  return contentType;
};

const getResponseContent = (request: chrome.devtools.network.Request) => {
  return new Promise<{ content: string; encoding: string }>((resolve) => {
    request.getContent((content, encoding) => {
      resolve({ content, encoding });
    });
  });
};
const makeRequestId = (request: chrome.devtools.network.Request) => {
  return (
    request.startedDateTime +
    request.request.url +
    request.response.status +
    request.time
  );
};
const prettify = (query: string) => {
  return prettier.format(query.trim(), {
    parser: 'graphql',
    plugins: [prettierGraphql],
    tabWidth: 2,
  });
};
const getMainQueryType = (requestContents: RequestContent[]) => {
  for (const requestContent of requestContents) {
    const ast = parse(requestContent.query);
    for (const def of ast.definitions) {
      if (def.kind === Kind.OPERATION_DEFINITION) {
        return def.operation;
      }
    }
  }
};
const getName = (requestContents: RequestContent[]) => {
  const requestContentCount = requestContents.length;

  if (requestContentCount === 0) {
    return 'Unknown';
  }

  if (requestContentCount === 1) {
    return (
      requestContents.at(0)?.selectedOperationName ??
      requestContents.at(0)?.operationNames.at(0) ??
      'Unknown'
    );
  }

  const firstRequestContent = requestContents.at(0);
  const firstOperationName =
    firstRequestContent?.selectedOperationName ??
    firstRequestContent?.operationNames.at(0) ??
    'Unknown';

  return `${firstOperationName} + ${requestContentCount - 1} more`;
};
export const parseGraphqlRequest = (request: chrome.devtools.network.Request) => {
  const requestContentType = getContentType(request.request.headers);
  // ignore requests that explicitly specify a content type, and the content type is not a valid graphql request
  if (
    requestContentType &&
    ![
      'application/json',
      'text/plain',
      'application/graphql-response+json',
    ].includes(requestContentType)
  ) {
    return;
  }

  const responseContentType = getContentType(request.response.headers);
  // ignore responses that explicitly specify a content type, and the content type is not a valid graphql response
  if (
    responseContentType &&
    ![
      'application/json',
      'text/plain',
      'application/graphql-response+json',
    ].includes(responseContentType)
  ) {
    return;
  }

  if (request.request.postData?.text) {
    const data = parseJson(request.request.postData.text);
    if (!data) {
      return;
    }
    const { success, data: res } = gqlRequestSchema.safeParse(data);
    if (!success) {
      return;
    }
    return res;
  }

  if (
    request.request.method.toLowerCase() === 'get' &&
    request.request.queryString.length
  ) {
    const data: Record<string, string> = {};
    for (const param of request.request.queryString) {
      if (param.name === 'variables') {
        data[param.name] = parseJson(param.value);
        continue;
      }
      data[param.name] = param.value;
    }

    const { success, data: res } = gqlRequestSchema.safeParse(data);
    if (!success) {
      return;
    }

    return res;
  }

  return;
};

export const getRequest = async (request: chrome.devtools.network.Request) => {
  const data = parseGraphqlRequest(request);
  if (!data) {
    return;
  }
  const responseContent = await getResponseContent(request);
  const requestContents: RequestContent[] = [];
  if (Array.isArray(data)) {
    for (const d of data) {
      requestContents.push({
        selectedOperationName: d.operationName,
        operationNames: getOperationNames(d.query),
        queryRaw: d.query,
        query: await prettify(d.query),
        variables: d.variables,
      });
    }
  } else {
    requestContents.push({
      selectedOperationName: data.operationName,
      operationNames: getOperationNames(data.query),
      queryRaw: data.query,
      query: await prettify(data.query),
      variables: data.variables,
    });
  }

  return {
    id: makeRequestId(request),
    name: getName(requestContents),
    method: request.request.method,
    status: request.response.status,
    contentType: request.response.content.mimeType,
    size: request.response.content.size,
    time: request.time,
    url: request.request.url,
    queryType: getMainQueryType(requestContents) ?? 'query',
    requestHeaders: request.request.headers.reduce(
      (acc, header) => ({ ...acc, [header.name]: header.value }),
      {}
    ),
    responseHeaders: request.response.headers.reduce(
      (acc, header) => ({ ...acc, [header.name]: header.value }),
      {}
    ),
    requestContent: requestContents,
    responseContent: responseContent.content,
  };
};
