import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PluginRegistryService } from '../../services';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';


@Component({
  selector: 'app-plugin-manager',
  templateUrl: './plugin-manager.component.html',
  styles: []
})
export class PluginManagerComponent  {

  @Input() showPluginManager = false;
  @Input() settings: SettingsState;

  @Output() toggleDialogChange = new EventEmitter();
  @Output() settingsJsonChange = new EventEmitter();

  remotePlugins$: Observable<[]>;
  selectedPluginItem: any;

  shouldRestart = false;

  constructor(
    private pluginRegistry: PluginRegistryService,
  ) {
    this.remotePlugins$ = this.pluginRegistry.getRemotePluginList().pipe(
      catchError((error) => {
        return of(null);
      }),
      map((data: any) => {
        if (data) {
          return data.items;
        }
      })
    );
  }

  

  onSelectPlugin(pluginItem: any) {
    this.selectedPluginItem = pluginItem;
  }

  isPluginInstalled(pluginName: string) {
    if (this.settings['plugin.list']) {
      return this.settings['plugin.list'].some(item => {
        const pluginInfo = this.pluginRegistry.getPluginInfoFromString(item);
        if (pluginInfo) {
          return pluginInfo.name === pluginName;
        }
        return false;
      });
    }
    return false;
  }

  onAddPlugin(pluginName: string) {
    const settings: SettingsState = JSON.parse(JSON.stringify(this.settings));
    settings['plugin.list'] = settings['plugin.list'] || [];
    settings['plugin.list'].push(pluginName);

    this.settingsJsonChange.next(JSON.stringify(settings));
    this.shouldRestart = true;
  }
  onRemovePlugin(pluginName: string) {
    const settings: SettingsState = JSON.parse(JSON.stringify(this.settings));
    settings['plugin.list'] = (settings['plugin.list'] || []).filter(pluginStr => {
      const pluginInfo = this.pluginRegistry.getPluginInfoFromString(pluginStr);
      if (pluginInfo) {
        return pluginName !== pluginInfo.name;
      }
    });

    this.settingsJsonChange.next(JSON.stringify(settings));
    this.shouldRestart = true;
  }

  onRestartApp() {
    location.reload();
  }

  trackByName(index: number, item: any) {
    return item.name;
  }
}
