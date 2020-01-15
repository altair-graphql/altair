import { GraphQLArgument } from 'graphql';

export interface DocumentIndexEntry {
  search: string;
  name: string;
  description: string;
  cat: string;
  highlight: string;
  args?: GraphQLArgument[],
  type?: string;
  isQuery?: Boolean;
}
