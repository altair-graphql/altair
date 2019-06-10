import { Injectable } from '@angular/core';
import { debug } from 'app/utils/logger';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { AltairPlugin, PluginRegistryMap, PluginInstance, PluginSource, PluginManifest, PluginType } from './plugin';

@Injectable()
export class PluginRegistryService {

  private registry: PluginRegistryMap = {};
  private pluginRegistrySubject$ = new Subject<PluginRegistryMap>();

  constructor(
    private http: HttpClient,
  ) {}

  add(key: string, pluginInstance: PluginInstance) {
    this.registry[key] = pluginInstance;
    this.emitRegistryUpdate();
  }

  getPlugin(name: string, pluginSource = PluginSource.NPM) {
    debug.log('PLUGIN: ', name, pluginSource);
    const baseUrl = 'https://cdn.jsdelivr.net/npm/';
    const version = 'latest';
    const pluginBaseUrl = `${baseUrl}${name}@${version}/`;
    const manifestUrl = `${pluginBaseUrl}manifest.json`;
    // Get manifest file
    this.http.get(manifestUrl).subscribe(async (manifest: PluginManifest) => {
      debug.log('PLUGIN', manifest);

      if (manifest) {
        if (manifest.scripts && manifest.scripts.length) {
          debug.log('PLUGIN', manifest.scripts);

          await Promise.all(manifest.scripts.map(script => {
            return this.injectPluginScript(`${pluginBaseUrl}${script}`);
          }));
          this.add(name, new AltairPlugin(name, manifest));
          debug.log('PLUGIN', 'plugin scripts injected and loaded.');
        }
      }
    });
  }

  installedPlugins() {
    return this.pluginRegistrySubject$;
  }

  setPluginActive(name: string, active: boolean) {
    const pluginInstance = this.registry[name];
    if (!pluginInstance) {
      debug.error(`"${name}" plugin not found in registry!`);
      return;
    }

    // If plugin is a sidebar plugin and we want to set the plugin active,
    // disable other sidebar plugins first
    if (active && pluginInstance.type === PluginType.SIDEBAR) {
      Object.values(this.registry).forEach(plugin => {
        if (plugin.name !== name && plugin.type === PluginType.SIDEBAR) {
          plugin.isActive = false;
        }
      });
    }
    pluginInstance.isActive = active;
    this.emitRegistryUpdate();
  }

  getPluginProps() {
    // Props are the data that would be accessible to the plugin
  }
  getPluginContext() {
    // Context is basically an object with the set of allowed functionality
    // Returns context based on type of plugin.
  }

  private emitRegistryUpdate() {
    this.pluginRegistrySubject$.next(this.registry);
  }
  private injectPluginScript(url) {
    return new Promise((resolve, reject) => {
      const head = document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      head.appendChild(script);
    });
  }

}
