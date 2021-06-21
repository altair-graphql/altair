import { AltairPanel, AltairPlugin, AltairUiAction, PluginClassInstance } from '../../plugin/plugin.interfaces';
import { IDictionary } from '../shared';

export interface PluginStateEntry {
  name: string;
  context: any;
  plugin: AltairPlugin;
  isActive?: boolean;
  instance?: PluginClassInstance;
}

export interface LocalState {
  closedWindows: any[];
  installedPlugins: IDictionary<PluginStateEntry>;
  panels: AltairPanel[];
  uiActions: AltairUiAction[];
}
