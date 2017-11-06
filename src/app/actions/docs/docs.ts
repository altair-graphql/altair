import { Action } from '@ngrx/store';

export const TOGGLE_DOCS_VIEW = 'TOGGLE_DOCS_VIEW';
export const START_LOADING_DOCS = 'START_LOADING_DOCS';
export const STOP_LOADING_DOCS = 'STOP_LOADING_DOCS';

export class ToggleDocsViewAction implements Action {
    readonly type = TOGGLE_DOCS_VIEW;

    constructor(public windowId: string) {}
}
export class StartLoadingDocsAction implements Action {
  readonly type = START_LOADING_DOCS;

  constructor(public windowId: string) {}
}
export class StopLoadingDocsAction implements Action {
    readonly type = STOP_LOADING_DOCS;

    constructor(public windowId: string) {}
}
