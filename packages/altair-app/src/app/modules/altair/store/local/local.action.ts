import { Action as NGRXAction } from '@ngrx/store';
import { AltairPanel } from 'altair-graphql-core/build/plugin/panel';
import { AltairUiAction } from 'altair-graphql-core/build/plugin/ui-action';
import { PluginStateEntry } from 'altair-graphql-core/build/types/state/local.interfaces';

export const PUSH_CLOSED_WINDOW_TO_LOCAL = 'PUSH_CLOSED_WINDOW_TO_LOCAL';
export const POP_FROM_CLOSED_WINDOWS = 'POP_FROM_CLOSED_WINDOWS';
export const ADD_INSTALLED_PLUGIN_ENTRY = 'ADD_INSTALLED_PLUGIN_ENTRY';
export const SET_PLUGIN_ACTIVE = 'SET_PLUGIN_ACTIVE';
export const ADD_PANEL = 'ADD_PANEL';
export const REMOVE_PANEL = 'REMOVE_PANEL';
export const SET_PANEL_ACTIVE = 'SET_PANEL_ACTIVE';
export const ADD_UI_ACTION = 'ADD_UI_ACTION';
export const REMOVE_UI_ACTION = 'REMOVE_UI_ACTION';

export class PushClosedWindowToLocalAction implements NGRXAction {
  readonly type = PUSH_CLOSED_WINDOW_TO_LOCAL;

  constructor(public payload: { window: any }) {}
}

export class PopFromClosedWindowsAction implements NGRXAction {
  readonly type = POP_FROM_CLOSED_WINDOWS;
}

export class AddInstalledPluginEntryAction implements NGRXAction {
  readonly type = ADD_INSTALLED_PLUGIN_ENTRY;

  constructor(public payload: PluginStateEntry) {}
}

export class SetPluginActiveAction implements NGRXAction {
  readonly type = SET_PLUGIN_ACTIVE;

  constructor(public payload: { pluginName: string, isActive: boolean }) {}
}

export class AddPanelAction implements NGRXAction {
  readonly type = ADD_PANEL;

  constructor(public payload: AltairPanel) {}
}

export class RemovePanelAction implements NGRXAction {
  readonly type = REMOVE_PANEL;

  constructor(public payload: { panelId: string }) {}
}

export class SetPanelActiveAction implements NGRXAction {
  readonly type = SET_PANEL_ACTIVE;

  constructor(public payload: { panelId: string, isActive: boolean }) {}
}

export class AddUiActionAction implements NGRXAction {
  readonly type = ADD_UI_ACTION;

  constructor(public payload: AltairUiAction) {}
}

export class RemoveUiActionAction implements NGRXAction {
  readonly type = REMOVE_UI_ACTION;

  constructor(public payload: { actionId: string }) {}
}

export type Action =
  | PushClosedWindowToLocalAction
  | PopFromClosedWindowsAction
  | AddInstalledPluginEntryAction
  | SetPluginActiveAction
  | AddPanelAction
  | RemovePanelAction
  | SetPanelActiveAction
  | AddUiActionAction
  | RemoveUiActionAction
  ;
