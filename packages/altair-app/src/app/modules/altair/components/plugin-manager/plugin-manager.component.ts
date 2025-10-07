import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PluginRegistryService } from '../../services';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { APSPluginDefinition } from 'altair-graphql-core/build/plugin/server/types';

@Component({
  selector: 'app-plugin-manager',
  templateUrl: './plugin-manager.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PluginManagerComponent {
  @Input() showPluginManager = false;
  @Input() settings?: SettingsState;

  @Output() toggleDialogChange = new EventEmitter();
  @Output() settingsJsonChange = new EventEmitter();

  remotePlugins$: Observable<APSPluginDefinition[]>;
  selectedPluginItem?: APSPluginDefinition;

  shouldRestart = false;

  constructor(private pluginRegistry: PluginRegistryService) {
    this.remotePlugins$ = this.pluginRegistry.getRemotePluginList().pipe(
      catchError((error) => {
        return of(null);
      }),
      map((data) => {
        if (data) {
          return data.plugins;
        }

        return [];
      })
    );
  }

  onSelectPlugin(pluginItem: APSPluginDefinition) {
    this.selectedPluginItem = pluginItem;
  }

  isPluginInstalled(pluginId: string) {
    if (this.settings?.['plugin.list']) {
      return this.settings['plugin.list'].some((item) => {
        const pluginInfo = this.pluginRegistry.getPluginInfoFromString(item);
        if (pluginInfo) {
          return pluginInfo.name === pluginId;
        }
        return false;
      });
    }
    return false;
  }

  async onAddPlugin(pluginId: string) {
    await this.pluginRegistry.addPluginToSettings(pluginId);
    this.shouldRestart = true;
  }
  async onRemovePlugin(pluginId: string) {
    await this.pluginRegistry.removePluginFromSettings(pluginId);
    this.shouldRestart = true;
  }

  onRestartApp() {
    this.toggleDialogChange.emit(false);
    location.reload();
  }

  trackById<T extends { id: string | null }>(index: number, item: T) {
    return item.id;
  }
}
