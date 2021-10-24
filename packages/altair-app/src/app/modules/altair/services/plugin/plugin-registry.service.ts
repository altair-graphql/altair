import { Injectable } from '@angular/core';
import { debug } from '../../utils/logger';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import * as localActions from '../../store/local/local.action';
import { PluginContextService } from './context/plugin-context.service';
import { AltairPlugin, createPlugin, PluginManifest, PluginSource } from 'altair-graphql-core/build/plugin/plugin.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { PluginStateEntry } from 'altair-graphql-core/build/types/state/local.interfaces';
import { PluginConstructor } from 'altair-graphql-core/build/plugin/base';

const PLUGIN_NAME_PREFIX = 'altair-graphql-plugin-';

interface PluginInfo extends Record<string, string> {
  name: string;
  version: string;
  pluginSource: PluginSource;
}

@Injectable()
export class PluginRegistryService {
  private fetchedPlugins: Promise<any>[] = [];

  constructor(
    private http: HttpClient,
    private pluginContextService: PluginContextService,
    private store: Store<RootState>,
  ) {}

  async add(name: string, plugin: AltairPlugin) {
    const context = this.pluginContextService.createContext(name, plugin);
    const RetrievedPluginClass = this.getPluginClass(plugin);
    const pluginStateEntry: PluginStateEntry = {
      name,
      context,
      instance: RetrievedPluginClass ? new RetrievedPluginClass() : undefined,
      plugin,
    };

    if (!pluginStateEntry.instance) {
      throw new Error(`Could not create the plugin instance for plugin: ${name}. Check that plugin_class is set correctly in manifest.`);
    }

    pluginStateEntry.instance.initialize(context);
    this.store.dispatch(new localActions.AddInstalledPluginEntryAction(pluginStateEntry));
  }

  getRemotePluginList() {
    return this.http.get('https://altair-plugin-server.sirmuel.workers.dev/list?v=2');
  }

  fetchPlugin(name: string, opts: PluginInfo) {
    if (!name) {
      return;
    }

    // TODO: Check if plugin with name already exists
    this.fetchedPlugins.push(
      this.fetchPluginAssets(name, opts)
    );
  }

  installedPlugins() {
    return this.store.select(state => state.local.installedPlugins);
  }

  /**
   * Given a plugin string in the format: <plugin-source>:<plugin-name>@<version>::[<opt>]->[<opt-value>],
   * it returns the details of the plugin
   * @param pluginStr
   */
  getPluginInfoFromString(pluginStr: string): PluginInfo | undefined {
    const matches = pluginStr.match(/(([A-Za-z_]*)\:)?(.[A-Za-z0-9\-]*)(@([^#\:\[\]]*))?(\:\:\[(.*)\]->\[(.*)\])?/);
    if (matches && matches.length) {
      const [, , pluginSource = PluginSource.NPM, pluginName, , pluginVersion = 'latest', , opt, optVal ] = matches;
      if (pluginName && pluginVersion) {
        if (!pluginName.startsWith(PLUGIN_NAME_PREFIX)) {
          throw new Error(`Plugin name must start with ${PLUGIN_NAME_PREFIX}`);
        }
        return {
          name: pluginName,
          version: pluginVersion,
          pluginSource: pluginSource as PluginSource,
          ...opt && optVal && { [opt]: optVal },
        };
      }
    }
  }

  pluginsReady() {
    return Promise.all(this.fetchedPlugins);
  }

  private async fetchPluginAssets(name: string, { pluginSource = PluginSource.NPM, version = 'latest', ...remainingOpts }: PluginInfo) {
    debug.log('PLUGIN: ', name, pluginSource, version);

    const pluginBaseUrl = this.getPluginBaseURL({
      pluginSource,
      version,
      ...remainingOpts,
    });

    const manifestUrl = this.resolveURL(pluginBaseUrl, 'manifest.json');

    try {
      // Get manifest file
      const manifest = (await this.http.get(manifestUrl).toPromise()) as PluginManifest;

      debug.log('PLUGIN', manifest);

      if (manifest) {
        if (manifest.styles && manifest.styles.length) {
          debug.log('PLUGIN styles', manifest.styles);

          await Promise.all(manifest.styles.map(style => {
            return this.injectPluginStylesheet(this.resolveURL(pluginBaseUrl, style));
          }));
        }
        if (manifest.scripts && manifest.scripts.length) {
          debug.log('PLUGIN scripts', manifest.scripts);

          await Promise.all(manifest.scripts.map(script => {
            return this.injectPluginScript(this.resolveURL(pluginBaseUrl, script));
          }));
        }
        const plugin = createPlugin(name, manifest);
        await this.add(name, plugin);
        debug.log('PLUGIN', 'plugin scripts and styles injected and loaded.');

        return plugin;
      }
    } catch (error) {
      debug.error('Error fetching plugin assets', error);
    }
  }

  private injectPluginScript(url: string) {
    return new Promise((resolve, reject) => {
      const head = document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = () => resolve(null);
      script.onerror = (err: any) => reject(err);
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
      style.onload = () => resolve(null);
      style.onerror = (err: any) => reject(err);
      head.appendChild(style);
    });
  }

  private getPluginBaseURL(pluginInfo: PluginInfo) {
    switch (pluginInfo.pluginSource) {
      case PluginSource.NPM:
        return this.getNPMPluginBaseURL(pluginInfo.name, { version: pluginInfo.version });
        case PluginSource.GITHUB:
        return this.getGithubPluginBaseURL(pluginInfo.name, pluginInfo);
      case PluginSource.URL:
        return this.getURLPluginBaseURL(pluginInfo.name, pluginInfo);
    }
  }

  private getNPMPluginBaseURL(name: string, { version = 'latest' }) {
    const baseUrl = 'https://cdn.jsdelivr.net/npm/';
    const pluginBaseUrl = `${baseUrl}${name}@${version}/`;
    return pluginBaseUrl;
  }

  private getGithubPluginBaseURL(name: string, pluginInfo: PluginInfo) {
    const baseUrl = 'https://cdn.jsdelivr.net/gh/';
    const versionSuffix = pluginInfo.version === 'latest' ? '' : `@${pluginInfo.version}`;
    const pluginBaseUrl = `${baseUrl}${pluginInfo.repo}${versionSuffix}/`;
    return pluginBaseUrl;
  }

  private getURLPluginBaseURL(name: string, opts: any) {
    return opts.url;
  }

  private resolveURL(baseURL: string, path: string) {
    return baseURL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  }

  private getPluginClass(plugin: AltairPlugin) {
    if (plugin.plugin_class) {
      return (window as any)['AltairGraphQL'].plugins[plugin.plugin_class] as PluginConstructor;
    }
    return;
  }
}
