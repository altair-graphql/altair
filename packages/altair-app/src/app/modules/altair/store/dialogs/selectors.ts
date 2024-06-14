import { createSelector } from '@ngrx/store';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';

export const getDialogs = (state: PerWindowState) => state.dialogs;
export const getShowHeaderDialog = createSelector(
  getDialogs,
  (state) => state.showHeaderDialog
);
export const getShowVariableDialog = createSelector(
  getDialogs,
  (state) => state.showVariableDialog
);
export const getShowRequestHandlerDialog = createSelector(
  getDialogs,
  (state) => state.showRequestHandlerDialog
);
export const getShowHistoryDialog = createSelector(
  getDialogs,
  (state) => state.showHistoryDialog
);
export const getShowPreRequestDialog = createSelector(
  getDialogs,
  (state) => state.showPreRequestDialog
);
export const getShowRequestExtensionsDialog = createSelector(
  getDialogs,
  (state) => state.showRequestExtensionsDialog
);
