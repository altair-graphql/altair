
export interface DocView {
  /**
   * type, field, root, search
   */
  view: string;
  /**
   * used by field views
   */
  parentType: string;
  /**
   * identifies type/field
   */
  name: string;
}

export interface DocsState {
  showDocs: boolean;
  isLoading: boolean;
  docView: DocView;
}
