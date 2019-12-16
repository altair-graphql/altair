import { Injectable } from '@angular/core';
import { debug } from 'app/utils/logger';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { AltairPlugin, PluginRegistryMap, PluginInstance, PluginSource, PluginManifest, PluginType } from './plugin';

@Injectable()
export class PluginRegistryService {

  private registry: PluginRegistryMap = {};
  private pluginRegistrySubject$ = new Subject<PluginRegistryMap>();
  private fetchedPlugins: Promise<any>[] = [];

  constructor(
    private http: HttpClient,
  ) {}

  add(key: string, pluginInstance: PluginInstance) {
    this.registry[key] = pluginInstance;
    this.emitRegistryUpdate();
  }

  getPlugin(name: string, opts: any = {}) {
    if (!name || this.registry[name]) {
      return;
    }

    this.fetchedPlugins.push(
      this.fetchPluginAssets(name, opts)
    );
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

  /**
   * Given a plugin string in the format: <plugin-name>@<version>,
   * it returns the details of the plugin
   * @param pluginStr
   */
  getPluginInfoFromString(pluginStr: string) {
    const matches = pluginStr.match(/(.[^@]*)(@(.*))?/);
    if (matches && matches.length) {
      const [, pluginName, , pluginVersion = 'latest'] = matches;
      if (pluginName && pluginVersion) {
        return {
          name: pluginName,
          version: pluginVersion,
        };
      }
    }
    return null;
  }

  pluginsReady() {
    return Promise.all(this.fetchedPlugins);
  }

  private async fetchPluginAssets(name: string, { pluginSource = PluginSource.NPM, version = 'latest', ...remainingOpts }: any = {}) {
    debug.log('PLUGIN: ', name, pluginSource, version);

    let pluginBaseUrl = ``;
    switch (pluginSource) {
      case PluginSource.NPM:
        pluginBaseUrl = this.getNPMPluginBaseURL(name, { version });
        break;
      case PluginSource.URL:
        pluginBaseUrl = this.getURLPluginBaseURL(name, { version, ...remainingOpts });
    }

    const manifestUrl = `${pluginBaseUrl}manifest.json`;

    try {
      // Get manifest file
      const manifest = (await this.http.get(manifestUrl).toPromise()) as PluginManifest;

      debug.log('PLUGIN', manifest);

      if (manifest) {
        if (manifest.styles && manifest.styles.length) {
          debug.log('PLUGIN styles', manifest.styles);

          await Promise.all(manifest.styles.map(style => {
            return this.injectPluginStylesheet(`${pluginBaseUrl}${style}`);
          }));
        }
        if (manifest.scripts && manifest.scripts.length) {
          debug.log('PLUGIN scripts', manifest.scripts);

          await Promise.all(manifest.scripts.map(script => {
            return this.injectPluginScript(`${pluginBaseUrl}${script}`);
          }));
        }
        const pluginInstance = new AltairPlugin(name, manifest);
        this.add(name, pluginInstance);
        debug.log('PLUGIN', 'plugin scripts and styles injected and loaded.');

        return pluginInstance;
      }
    } catch (error) {
      debug.error('Error fetching plugin assets', error);
    }
  }

  private emitRegistryUpdate() {
    this.pluginRegistrySubject$.next(this.registry);
  }
  private injectPluginScript(url: string) {
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
  private injectPluginStylesheet(url: string) {
    return new Promise((resolve, reject) => {
      const head = document.getElementsByTagName('head')[0];
      const style = document.createElement('link');
      style.type = 'text/css';
      style.rel = 'stylesheet';
      style.href = url;
      style.onload = () => resolve();
      style.onerror = (err) => reject(err);
      head.appendChild(style);
    });
  }

  private getNPMPluginBaseURL(name: string, { version = 'latest' }) {
    const baseUrl = 'https://cdn.jsdelivr.net/npm/';
    const pluginBaseUrl = `${baseUrl}${name}@${version}/`;
    return pluginBaseUrl;
  }

  private getURLPluginBaseURL(name: string, opts: any) {
    return opts.url;
  }

}
