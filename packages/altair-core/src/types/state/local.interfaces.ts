import { PluginBase } from '../../plugin/base';
import { AltairPanel } from '../../plugin/panel';
import { AltairPlugin } from '../../plugin/plugin.interfaces';
import { AltairUiAction } from '../../plugin/ui-action';
import { IDictionary } from '../shared';

export interface PluginStateEntry {
  name: string;
  context: any;
  plugin: AltairPlugin;
  isActive?: boolean;
  instance?: PluginBase;
}

export interface LocalState {
  closedWindows: any[];
  installedPlugins: IDictionary<PluginStateEntry>;
  panels: AltairPanel[];
  uiActions: AltairUiAction[];
}
