import { PluginBase } from '../../plugin/base';
import { PluginContext } from '../../plugin/context/context.interface';
import { AltairPanel } from '../../plugin/panel';
import { AltairPlugin } from '../../plugin/plugin.interfaces';
import { AltairUiAction } from '../../plugin/ui-action';
import { IDictionary } from '../shared';
import { IRemoteQueryCollection } from './collection.interfaces';
import { PerWindowState } from './per-window.interfaces';

export interface PluginStateEntry {
  name: string;
  context: PluginContext;
  plugin: AltairPlugin;
  isActive?: boolean;
  instance?: PluginBase;
}

export interface LocalState {
  closedWindows: PerWindowState[];
  installedPlugins: IDictionary<PluginStateEntry>;
  panels: AltairPanel[];
  uiActions: AltairUiAction[];
}
