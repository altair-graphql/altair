export interface TypeDocView {
  view: 'type';
  name: string;
}
export interface FieldDocView {
  view: 'field';
  name: string;
  parentType: string;
}
export interface RootDocView {
  view: 'root';
}
export interface SearchDocView {
  view: 'search';
}

export type DocView = TypeDocView | FieldDocView | RootDocView | SearchDocView;

export interface DocsState {
  showDocs: boolean;
  isLoading: boolean;
  docView: DocView;
}
