import { createSelector } from '@ngrx/store';
import { AltairPanelLocation } from 'altair-graphql-core/build/plugin/panel';
import { AltairUiActionLocation } from 'altair-graphql-core/build/plugin/ui-action';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

export const getLocalState = (state: RootState) => state.local;
export const getPanels = createSelector(getLocalState, local => local.panels);
export const getSidebarPanels = createSelector(getPanels, panels => panels.filter(_ => _.location === AltairPanelLocation.SIDEBAR));
export const getResultPaneBottomPanels = createSelector(getPanels, panels =>
  panels.filter(_ => _.location === AltairPanelLocation.RESULT_PANE_BOTTOM));
export const getHeaderPanels = createSelector(getPanels, panels => panels.filter(_ => _.location === AltairPanelLocation.HEADER));
export const getUiActions = createSelector(getLocalState, local => local.uiActions);
export const getResultPaneUiActions = createSelector(getUiActions, uiActions =>
  uiActions.filter(_ => _.location === AltairUiActionLocation.RESULT_PANE));
