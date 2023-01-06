import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PluginRegistryService } from '../../services';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { RemotePluginListItem } from 'altair-graphql-core/build/plugin/plugin.interfaces';

@Component({
  selector: 'app-plugin-manager',
  templateUrl: './plugin-manager.component.html',
  styles: [],
})
export class PluginManagerComponent {
  @Input() showPluginManager = false;
  @Input() settings?: SettingsState;

  @Output() toggleDialogChange = new EventEmitter();
  @Output() settingsJsonChange = new EventEmitter();

  remotePlugins$: Observable<RemotePluginListItem[]>;
  selectedPluginItem: RemotePluginListItem;

  shouldRestart = false;

  constructor(private pluginRegistry: PluginRegistryService) {
    this.remotePlugins$ = this.pluginRegistry.getRemotePluginList().pipe(
      catchError((error) => {
        return of(null);
      }),
      map((data) => {
        if (data) {
          return data.items;
        }

        return [];
      })
    );
  }

  onSelectPlugin(pluginItem: RemotePluginListItem) {
    this.selectedPluginItem = pluginItem;
  }

  isPluginInstalled(pluginName: string) {
    if (this.settings?.['plugin.list']) {
      return this.settings['plugin.list'].some((item) => {
        const pluginInfo = this.pluginRegistry.getPluginInfoFromString(item);
        if (pluginInfo) {
          return pluginInfo.name === pluginName;
        }
        return false;
      });
    }
    return false;
  }

  async onAddPlugin(pluginName: string) {
    await this.pluginRegistry.addPluginToSettings(pluginName);
    this.shouldRestart = true;
  }
  async onRemovePlugin(pluginName: string) {
    await this.pluginRegistry.removePluginFromSettings(pluginName);
    this.shouldRestart = true;
  }

  onRestartApp() {
    this.toggleDialogChange.emit(false);
    location.reload();
  }

  trackByName<T extends { name: string | null }>(index: number, item: T) {
    return item.name;
  }
}
