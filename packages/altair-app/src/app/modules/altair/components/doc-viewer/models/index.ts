import { GraphQLArgument } from 'graphql';

interface BaseDocumentIndexEntry {
  search: string;
  name: string;
  description: string;
  cat: string;
  highlight: string;
  args?: { name: string; description: string }[];
  type?: string;
  isQuery?: boolean;
}

export interface DocumentIndexFieldEntry extends BaseDocumentIndexEntry {
  cat: 'field';
  type: string;
}

export interface DocumentIndexTypeEntry extends BaseDocumentIndexEntry {
  cat: 'type';
  isRoot?: boolean;
}

export type DocumentIndexEntry =
  | DocumentIndexFieldEntry
  | DocumentIndexTypeEntry;
// export interface DocumentIndexEntry extends DocumentIndexFieldEntry, Docu {
//   search: string;
//   name: string;
//   description: string;
//   cat: 'type' | 'field';
//   highlight: string;
//   args?: { name: string; description?: string | null }[];
//   type?: string;
//   isQuery?: boolean;
// }
