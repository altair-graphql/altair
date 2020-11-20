import { createSelector } from '@ngrx/store';
import * as fromRoot from '../';
import { AltairPanelLocation, AltairUiActionLocation } from 'app/services/plugin/plugin';

export const getLocalState = (state: fromRoot.State) => state.local;
export const getPanels = createSelector(getLocalState, local => local.panels);
export const getSidebarPanels = createSelector(getPanels, panels => panels.filter(_ => _.location === AltairPanelLocation.SIDEBAR));
export const getHeaderPanels = createSelector(getPanels, panels => panels.filter(_ => _.location === AltairPanelLocation.HEADER));
export const getUiActions = createSelector(getLocalState, local => local.uiActions);
export const getResultPaneUiActions = createSelector(getUiActions, uiActions =>
  uiActions.filter(_ => _.location === AltairUiActionLocation.RESULT_PANE));
