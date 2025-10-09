import { Injectable, inject } from '@angular/core';
import { debug } from '../../utils/logger';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { v4 as uuid } from 'uuid';

import * as localActions from '../../store/local/local.action';
import * as settingsActions from '../../store/settings/settings.action';
import { PluginContextService } from './context/plugin-context.service';
import {
  AltairV1Plugin,
  createV1Plugin,
  PluginManifest,
  PluginSource,
} from 'altair-graphql-core/build/plugin/plugin.interfaces';
import { PluginV3Manifest } from 'altair-graphql-core/build/plugin/v3/manifest';
import {
  PluginParentWorker,
  PluginParentWorkerOptions,
} from 'altair-graphql-core/build/plugin/v3/parent-worker';
import { PluginParentEngine } from 'altair-graphql-core/build/plugin/v3/parent-engine';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import {
  V1PluginStateEntry,
  V3PluginStateEntry,
} from 'altair-graphql-core/build/types/state/local.interfaces';
import { PluginConstructor } from 'altair-graphql-core/build/plugin/base';
import { DbService } from '../db.service';
import { take } from 'rxjs/operators';
import { NotifyService } from '../notify/notify.service';
import sanitize from 'sanitize-html';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { environment } from 'environments/environment';
import {
  injectScript,
  injectStylesheet,
} from 'altair-graphql-core/build/utils/inject';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import { compare } from 'compare-versions';
import { APSPluginListResponse } from 'altair-graphql-core/build/plugin/server/types';
import { fromPromise } from '../../utils';

const PLUGIN_NAME_PREFIX = 'altair-graphql-plugin-';

const PLUGIN_APPROVED_MAP_STORAGE_KEY = '__user_plugin_approved_map';

type UserPluginApprovedMap = Record<string, Record<string, string[]>>;
const urlConfig = getAltairConfig().getUrlConfig(
  environment.production ? 'production' : 'development'
);
interface PluginInfo extends Record<string, string> {
  name: string;
  version: string;
  pluginSource: PluginSource;
}

@Injectable()
export class PluginRegistryService {
  private http = inject(HttpClient);
  private pluginContextService = inject(PluginContextService);
  private db = inject(DbService);
  private notifyService = inject(NotifyService);
  private store = inject<Store<RootState>>(Store);

  private fetchedPlugins: Promise<any>[] = [];

  addV1Plugin(name: string, plugin: AltairV1Plugin) {
    const context = this.pluginContextService.createV1Context(name, plugin);
    const RetrievedPluginClass = this.getPluginClass(plugin);
    const pluginStateEntry: V1PluginStateEntry = {
      manifest_version: plugin.manifest.manifest_version,
      name,
      context,
      instance: RetrievedPluginClass ? new RetrievedPluginClass() : undefined,
      plugin,
    };

    if (!pluginStateEntry.instance) {
      throw new Error(
        `Could not create the plugin instance for plugin: ${name}. Check that plugin_class is set correctly in manifest.`
      );
    }

    pluginStateEntry.instance.initialize(context);
    this.store.dispatch(
      new localActions.AddInstalledPluginEntryAction(pluginStateEntry)
    );
  }

  addV3Plugin(
    name: string,
    manifest: PluginV3Manifest,
    worker: PluginParentWorker,
    parentWorkerOptions: PluginParentWorkerOptions
  ) {
    const engine = new PluginParentEngine(worker);
    const context = this.pluginContextService.createV3Context(
      name,
      manifest,
      parentWorkerOptions
    );
    engine.start(context);
    const pluginStateEntry: V3PluginStateEntry = {
      manifest_version: manifest.manifest_version,
      name,
      context,
      engine,
      manifest,
    };

    this.store.dispatch(
      new localActions.AddInstalledPluginEntryAction(pluginStateEntry)
    );
  }

  getRemotePluginList() {
    // 'https://altair-plugin-server.sirmuel.workers.dev/list?v=2'
    const url = new URL('/data/v1/plugins.json', urlConfig.docs).href;
    return this.http.get<APSPluginListResponse>(url);
  }

  fetchPlugin(name: string, opts: PluginInfo) {
    if (!name) {
      return;
    }

    // TODO: Check if plugin with name already exists
    this.fetchedPlugins.push(this.fetchPluginAssets(name, opts));
  }

  installedPlugins() {
    return this.store.select((state) => state.local.installedPlugins);
  }

  /**
   * Given a plugin string in the format: <plugin-source>:<plugin-name>@<version>::[<opt>]->[<opt-value>],
   * it returns the details of the plugin
   * @param pluginStr
   */
  getPluginInfoFromString(pluginStr: string): PluginInfo | undefined {
    const matches = pluginStr.match(
      /(([A-Za-z_]*):)?(.[A-Za-z0-9-]*)(@([^#:[\]]*))?(::\[(.*)\]->\[(.*)\])?/
    );
    if (matches && matches.length) {
      const [
        ,
        ,
        pluginSource = PluginSource.NPM,
        pluginName,
        ,
        pluginVersion = 'latest',
        ,
        opt,
        optVal,
      ] = matches;
      if (pluginName && pluginVersion) {
        if (!pluginName.startsWith(PLUGIN_NAME_PREFIX)) {
          debug.error(`Plugin name must start with ${PLUGIN_NAME_PREFIX}`);
          return;
        }
        return {
          name: pluginName,
          version: pluginVersion,
          pluginSource: pluginSource as PluginSource,
          ...(opt && optVal && { [opt]: optVal }),
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

    const approvedMap: UserPluginApprovedMap | undefined = await this.db
      .getItem(PLUGIN_APPROVED_MAP_STORAGE_KEY)
      .pipe(take(1))
      .toPromise();

    if (!approvedMap) {
      return false;
    }

    if (!approvedMap[opts.pluginSource]) {
      return false;
    }

    if (!approvedMap[opts.pluginSource]?.[opts.name]) {
      return false;
    }

    return approvedMap[opts.pluginSource]?.[opts.name]?.includes(opts.version);
  }

  async addPluginToApprovedMap(opts: PluginInfo) {
    let approvedMap: UserPluginApprovedMap = {};
    if (opts.version === 'latest') {
      // latest version is not a valid version for user approval
      return;
    }

    const retrievedApprovedMap: UserPluginApprovedMap | undefined = await this.db
      .getItem(PLUGIN_APPROVED_MAP_STORAGE_KEY)
      .pipe(take(1))
      .toPromise();

    if (retrievedApprovedMap) {
      approvedMap = retrievedApprovedMap;
    }

    const pluginsApprovedMap = (approvedMap[opts.pluginSource] ||= {});

    const currentPluginApprovals = (pluginsApprovedMap[opts.name] ||= []);

    currentPluginApprovals.push(opts.version);

    await this.db
      .setItem(PLUGIN_APPROVED_MAP_STORAGE_KEY, approvedMap)
      .pipe(take(1))
      .toPromise();
  }

  async isPluginInSettings(pluginName: string) {
    const settings = await this.store
      .select((state) => state.settings)
      .pipe(take(1))
      .toPromise();

    if (settings?.['plugin.list']) {
      return settings['plugin.list'].some((item) => {
        const pluginInfo = this.getPluginInfoFromString(item);
        if (pluginInfo) {
          return pluginInfo.name === pluginName;
        }
        return false;
      });
    }
    return false;
  }

  async addPluginToSettings(pluginName: string) {
    const resp = await this.store
      .select((state) => state.settings)
      .pipe(take(1))
      .toPromise();

    const settings: SettingsState = JSON.parse(JSON.stringify(resp));
    settings['plugin.list'] = settings['plugin.list'] || [];
    settings['plugin.list'].push(pluginName);

    this.store.dispatch(
      new settingsActions.SetSettingsJsonAction({
        value: JSON.stringify(settings),
      })
    );
  }

  async removePluginFromSettings(pluginName: string) {
    const resp = await this.store
      .select((state) => state.settings)
      .pipe(take(1))
      .toPromise();
    const settings: SettingsState = JSON.parse(JSON.stringify(resp));

    settings['plugin.list'] = (settings['plugin.list'] || []).filter((pluginStr) => {
      const pluginInfo = this.getPluginInfoFromString(pluginStr);
      if (pluginInfo) {
        return pluginName !== pluginInfo.name;
      }
    });

    this.store.dispatch(
      new settingsActions.SetSettingsJsonAction({
        value: JSON.stringify(settings),
      })
    );
  }

  private async fetchPluginAssets(
    name: string,
    {
      pluginSource = PluginSource.NPM,
      version = 'latest',
      ...remainingOpts
    }: PluginInfo
  ) {
    debug.log('PLUGIN: ', name, pluginSource, version);

    const pluginBaseUrl = this.getPluginBaseURL({
      pluginSource,
      version,
      ...remainingOpts,
    });

    const manifestUrl = this.resolveURL(pluginBaseUrl, 'manifest.json');

    try {
      // Get manifest file
      const manifest = (await this.http.get(manifestUrl).toPromise()) as
        | PluginManifest
        | PluginV3Manifest;

      const opts: PluginInfo = {
        name,
        pluginSource,
        // get the real version from the manifest
        version: manifest.version,
      };
      const isUserApproved = await this.isUserApprovedPlugin(opts);

      if (!isUserApproved) {
        const canInstall = await this.notifyService.confirm(
          `Are you sure you want to install <strong>${sanitize(
            name
          )}</strong> plugin?`,
          'Plugin manager'
        );

        if (!canInstall) {
          await this.removePluginFromSettings(opts.name);
          return;
        }

        await this.addPluginToApprovedMap(opts);
      }

      debug.log('PLUGIN', manifest);

      // TODO: Validate v3 manifest
      if (manifest) {
        if (manifest.manifest_version === 1 || manifest.manifest_version === 2) {
          return this.fetchPluginV1Assets(name, manifest, pluginBaseUrl);
        }
        if (manifest.manifest_version >= 3 && 'entry' in manifest) {
          if (
            manifest.minimum_altair_version &&
            compare(manifest.minimum_altair_version, environment.version, '>')
          ) {
            this.notifyService.warning(
              `Plugin ${name} requires Altair version ${manifest.minimum_altair_version} or higher. Please update Altair to use this plugin.`
            );
            return;
          }
          return this.fetchPluginV3Assets(name, manifest, pluginBaseUrl);
        }
      }
    } catch (error) {
      debug.error('Error fetching plugin assets', error);
    }
  }

  private async fetchPluginV1Assets(
    name: string,
    manifest: PluginManifest,
    pluginBaseUrl: string
  ) {
    if (manifest?.styles?.length) {
      debug.log('V1 PLUGIN styles', manifest.styles);

      await Promise.all(
        manifest.styles.map((style) => {
          return injectStylesheet(this.resolveURL(pluginBaseUrl, style));
        })
      );
    }
    if (manifest?.scripts?.length) {
      debug.log('V1 PLUGIN scripts', manifest.scripts);

      await Promise.all(
        manifest.scripts.map((script) => {
          return injectScript(this.resolveURL(pluginBaseUrl, script));
        })
      );
    }
    const plugin = createV1Plugin(name, manifest);
    this.addV1Plugin(name, plugin);
    debug.log('PLUGIN', 'V1 plugin scripts and styles injected and loaded.');
    this.notifyService.warning(
      `V1 plugins are deprecated and will be disabled in the future. If you're an owner of ${name}, consider migrating to V3.`,
      undefined,
      {
        data: {
          url: 'https://altairgraphql.dev/docs/learn/mv3',
        },
      }
    );

    return plugin;
  }

  private async fetchPluginV3Assets(
    name: string,
    manifest: PluginV3Manifest,
    pluginBaseUrl: string
  ) {
    const id = `plugin-${uuid()}`;
    const entry = manifest.entry;
    if (entry.type === 'html') {
      const pluginEntrypointUrl = this.resolveURL(pluginBaseUrl, entry.path);
      const opts: PluginParentWorkerOptions = {
        id,
        type: 'url',
        pluginEntrypointUrl,
      };
      const worker = new PluginParentWorker(opts);
      this.addV3Plugin(name, manifest, worker, opts);
      debug.log('PLUGIN', 'V3 plugin loaded with src.');
    } else if (entry.type === 'js') {
      const scriptUrls = entry.scripts.map((script) =>
        this.resolveURL(pluginBaseUrl, script)
      );
      const styleUrls = entry.styles.map((style) =>
        this.resolveURL(pluginBaseUrl, style)
      );
      const opts: PluginParentWorkerOptions = {
        id,
        sandboxUrl: await getAltairConfig().getUrl(
          'sandbox',
          environment.production ? 'production' : 'development'
        ),
        type: 'scripts',
        scriptUrls,
        styleUrls,
      };
      const worker = new PluginParentWorker(opts);
      this.addV3Plugin(name, manifest, worker, opts);
    }
    return;
  }

  private getPluginBaseURL(pluginInfo: PluginInfo) {
    switch (pluginInfo.pluginSource) {
      case PluginSource.NPM:
        return this.getNPMPluginBaseURL(pluginInfo.name, {
          version: pluginInfo.version,
        });
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
    const versionSuffix =
      pluginInfo.version === 'latest' ? '' : `@${pluginInfo.version}`;
    const pluginBaseUrl = `${baseUrl}${pluginInfo.repo}${versionSuffix}/`;
    return pluginBaseUrl;
  }

  private getURLPluginBaseURL(name: string, opts: PluginInfo) {
    return opts.url || '';
  }

  private resolveURL(baseURL: string, path: string) {
    return baseURL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  }

  private getPluginClass(plugin: AltairV1Plugin) {
    if (plugin.plugin_class) {
      return (window as any)['AltairGraphQL'].plugins[
        plugin.plugin_class
      ] as PluginConstructor;
    }
    return;
  }
}
