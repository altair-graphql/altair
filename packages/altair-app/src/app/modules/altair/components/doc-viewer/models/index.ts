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

export interface DocumentIndexDirectiveEntry extends BaseDocumentIndexEntry {
  cat: 'directive';
  locations?: string[];
}

export type DocumentIndexEntry =
  | DocumentIndexFieldEntry
  | DocumentIndexTypeEntry
  | DocumentIndexDirectiveEntry;

export interface RelatedOperation {
  name: string;
  parentType: string;
  category: 'query' | 'mutation' | 'subscription';
  description: string;
}

export interface ParentTypeInfo {
  name: string;
  description: string;
  fieldCount: number;
}
