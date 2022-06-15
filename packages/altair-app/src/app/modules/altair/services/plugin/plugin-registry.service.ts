import { Injectable } from '@angular/core';
import { debug } from '../../utils/logger';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import * as localActions from '../../store/local/local.action';
import * as settingsActions from '../../store/settings/settings.action';
import { PluginContextService } from './context/plugin-context.service';
import { AltairPlugin, createPlugin, PluginManifest, PluginSource } from 'altair-graphql-core/build/plugin/plugin.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { PluginStateEntry } from 'altair-graphql-core/build/types/state/local.interfaces';
import { PluginConstructor } from 'altair-graphql-core/build/plugin/base';
import { DbService } from '../db.service';
import { first } from 'rxjs/operators';
import { NotifyService } from '../notify/notify.service';
import sanitize from 'sanitize-html';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';

const PLUGIN_NAME_PREFIX = 'altair-graphql-plugin-';

const PLUGIN_APPROVED_MAP_STORAGE_KEY = '__user_plugin_approved_map';

type UserPluginApprovedMap = Record<string, Record<string, string[]>>

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
    private db: DbService,
    private notifyService: NotifyService,
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

  async isUserApprovedPlugin(opts: PluginInfo) {
    if (opts.version === 'latest') {
      // latest version is not a valid version for user approval
      return false;
    }

    const approvedMap: UserPluginApprovedMap | undefined = await this.db.getItem(PLUGIN_APPROVED_MAP_STORAGE_KEY).pipe(first()).toPromise();

    if (!approvedMap) {
      return false;
    }

    if (!approvedMap[opts.pluginSource]) {
      return false;
    }

    if (!approvedMap[opts.pluginSource][opts.name]) {
      return false;
    }

    return approvedMap[opts.pluginSource][opts.name].includes(opts.version);
  }

  async addPluginToApprovedMap(opts: PluginInfo) {
    let approvedMap: UserPluginApprovedMap = {};
    if (opts.version === 'latest') {
      // latest version is not a valid version for user approval
      return;
    }

    const retrievedApprovedMap: UserPluginApprovedMap | undefined = await this.db.getItem(PLUGIN_APPROVED_MAP_STORAGE_KEY).pipe(first()).toPromise();

    if (retrievedApprovedMap) {
      approvedMap = retrievedApprovedMap;
    }

    if (!approvedMap[opts.pluginSource]) {
      approvedMap[opts.pluginSource] = {};
    }

    if (!approvedMap[opts.pluginSource][opts.name]) {
      approvedMap[opts.pluginSource][opts.name] = [];
    }

    approvedMap[opts.pluginSource][opts.name] = [ ...approvedMap[opts.pluginSource][opts.name], opts.version ];

    await this.db.setItem(PLUGIN_APPROVED_MAP_STORAGE_KEY, approvedMap).pipe(first()).toPromise();
  }

  async addPluginToSettings(pluginName: string) {
    const resp = await this.store.select(state => state.settings).pipe(first()).toPromise();

    const settings: SettingsState = JSON.parse(JSON.stringify(resp));
    settings['plugin.list'] = settings['plugin.list'] || [];
    settings['plugin.list'].push(pluginName);

    this.store.dispatch(new settingsActions.SetSettingsJsonAction({ value: JSON.stringify(settings) }));
  }

  async removePluginFromSettings(pluginName: string) {
    const resp = await this.store.select(state => state.settings).pipe(first()).toPromise();
    const settings: SettingsState = JSON.parse(JSON.stringify(resp));

    settings['plugin.list'] = (settings['plugin.list'] || []).filter(pluginStr => {
      const pluginInfo = this.getPluginInfoFromString(pluginStr);
      if (pluginInfo) {
        return pluginName !== pluginInfo.name;
      }
    });

    this.store.dispatch(new settingsActions.SetSettingsJsonAction({ value: JSON.stringify(settings) }));
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

      const opts: PluginInfo = {
        name,
        pluginSource,
        // get the real version from the manifest
        version: manifest.version,
      };
      const isUserApproved = await this.isUserApprovedPlugin(opts);

      if (!isUserApproved) {
        const canInstall = await this.notifyService.confirm(`Are you sure you want to install <strong>${sanitize(name)}</strong> plugin?`, 'Plugin manager');

        if (!canInstall) {
          await this.removePluginFromSettings(opts.name);
          return;
        }

        await this.addPluginToApprovedMap(opts);
      }

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
