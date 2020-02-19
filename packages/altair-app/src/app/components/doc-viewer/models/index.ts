import { GraphQLArgument } from 'graphql';

export interface DocumentIndexEntry {
  search: string;
  name: string;
  description: string;
  cat: string;
  highlight: string;
  args?: {name: string, description?: string | null}[],
  type?: string;
  isQuery?: Boolean;
}
