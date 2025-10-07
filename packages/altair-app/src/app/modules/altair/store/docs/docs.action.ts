import { Action as NGRXAction } from '@ngrx/store';
import { DocView } from 'altair-graphql-core/build/types/state/docs.interfaces';

export const TOGGLE_DOCS_VIEW = 'TOGGLE_DOCS_VIEW';
export const START_LOADING_DOCS = 'START_LOADING_DOCS';
export const STOP_LOADING_DOCS = 'STOP_LOADING_DOCS';
export const SET_DOC_VIEW = 'SET_DOC_VIEW';

export class ToggleDocsViewAction implements NGRXAction {
  readonly type = TOGGLE_DOCS_VIEW;

  constructor(public windowId: string) {}
}
export class StartLoadingDocsAction implements NGRXAction {
  readonly type = START_LOADING_DOCS;

  constructor(public windowId: string) {}
}
export class StopLoadingDocsAction implements NGRXAction {
  readonly type = STOP_LOADING_DOCS;

  constructor(public windowId: string) {}
}
export class SetDocViewAction implements NGRXAction {
  readonly type = SET_DOC_VIEW;

  constructor(
    public windowId: string,
    public payload: { docView: DocView }
  ) {}
}

export type Action =
  | ToggleDocsViewAction
  | StartLoadingDocsAction
  | StopLoadingDocsAction
  | SetDocViewAction;
