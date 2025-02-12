import { OperationTypeNode } from 'graphql';

export interface RequestContent {
  selectedOperationName?: string;
  operationNames: string[];
  query: string; // formatted query
  queryRaw: string;
  variables: unknown;
}
export interface GraphQLRequest {
  id: string;
  name: string;
  method: string;
  status: number;
  contentType: string;
  size: number;
  time: number;
  url: string;
  queryType: OperationTypeNode;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestContent: RequestContent[];
  responseContent?: unknown;
}
