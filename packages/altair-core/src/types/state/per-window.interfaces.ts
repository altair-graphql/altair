import { DialogState } from './dialog.interfaces';
import { DocsState } from './docs.interfaces';
import { GQLSchemaState } from './gql-schema.interfaces';
import { HeaderState } from './header.interfaces';
import { HistoryState } from './history.interfaces';
import { LayoutState } from './layout.interfaces';
import { PostrequestState } from './postrequest.interfaces';
import { PrerequestState } from './prerequest.interfaces';
import { QueryState } from './query.interfaces';
import { StreamState } from './stream.interfaces';
import { VariableState } from './variable.interfaces';

export interface PerWindowState {
  layout: LayoutState;
  query: QueryState;
  headers: HeaderState;
  variables: VariableState;
  dialogs: DialogState;
  schema: GQLSchemaState;
  docs: DocsState;
  history: HistoryState;
  stream: StreamState;
  preRequest: PrerequestState;
  postRequest: PostrequestState;
  windowId: string; // Used by the window reducer
}