import { Action } from '@ngrx/store';

export const TOGGLE_DOCS_VIEW = 'TOGGLE_DOCS_VIEW';

export class ToggleDocsViewAction implements Action {
    readonly type = TOGGLE_DOCS_VIEW;

    constructor(public windowId: string) {}
}
