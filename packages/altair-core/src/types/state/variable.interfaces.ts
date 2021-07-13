
export interface FileVariable {
  id?: string; // optional for backward compatibility
  name: string;
  isMultiple?: boolean;
  data?: File | File[]; // TODO: Remove File (maintaining for backward compatibility)
}

export interface VariableState {
  variables: string;
  files: FileVariable[];
}
