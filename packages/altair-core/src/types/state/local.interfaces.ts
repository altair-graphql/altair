import { PluginBase } from '../../plugin/base';
import { PluginContext } from '../../plugin/context/context.interface';
import { AltairPanel } from '../../plugin/panel';
import { AltairV1Plugin } from '../../plugin/plugin.interfaces';
import { AltairUiAction } from '../../plugin/ui-action';
import { PluginV3Context } from '../../plugin/v3/context';
import { PluginV3Manifest } from '../../plugin/v3/manifest';
import { PluginParentEngine } from '../../plugin/v3/parent-engine';
import { IDictionary } from '../shared';
import { PerWindowState } from './per-window.interfaces';

export interface V1PluginStateEntry {
  manifest_version: 1 | 2;
  name: string;
  context: PluginContext;
  plugin: AltairV1Plugin;
  isActive?: boolean;
  instance?: PluginBase;
}
export interface V3PluginStateEntry {
  manifest_version: 3;
  name: string;
  context: PluginV3Context;
  manifest: PluginV3Manifest;
  engine: PluginParentEngine;
  isActive?: boolean;
}

export interface LoadingRequestStateEntry {
  name: string;
  id: string;
  state: 'done' | 'error' | 'active' | 'pending';
  source: 'collection' | 'window';
  sourceId: string;
  type: 'pre-request' | 'post-request' | 'query' | 'auth';
}
export interface TemporaryWindowStateEntry {
  windowId: string;
  loadingRequestState: LoadingRequestStateEntry[];
}

/**
 * State for local (session) data.
 * This would contain arbitrary global data that should be stored in memory and not persisted
 */
export interface LocalState {
  closedWindows: PerWindowState[];
  installedPlugins: IDictionary<V1PluginStateEntry | V3PluginStateEntry>;
  panels: AltairPanel[];
  uiActions: AltairUiAction[];
  temporaryWindowStates: IDictionary<TemporaryWindowStateEntry>;
}
