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

export type DocSearchFilterKey = 
  | 'types' 
  | 'fields' 
  | 'queries' 
  | 'mutations' 
  | 'subscriptions' 
  | 'directives';

export interface DocSearchFilter {
  key: DocSearchFilterKey;
  translationKey: string;
}

export const DOC_SEARCH_FILTERS: readonly DocSearchFilter[] = [
  { key: 'types', translationKey: 'DOCS_TYPES_TEXT' },
  { key: 'fields', translationKey: 'DOCS_FIELDS_TEXT' },
  { key: 'queries', translationKey: 'DOCS_QUERIES_TEXT' },
  { key: 'mutations', translationKey: 'DOCS_MUTATIONS_TEXT' },
  { key: 'subscriptions', translationKey: 'DOCS_SUBSCRIPTIONS_TEXT' },
  { key: 'directives', translationKey: 'DOCS_DIRECTIVES_TEXT' },
] as const;
