import { Injectable } from '@angular/core';
import { debug } from 'app/utils/logger';
import { HttpClient } from '@angular/common/http';

enum PluginSource {
  NPM = 'npm',
  GITHUB = 'github'
}
enum PluginType {
  SIDEBAR = 'sidebar',
}
interface PluginManifest {
  manifest_version: number;
  name: string;
  version: string;
  description: string;
  authorEmail?: string;
  author?: string;
  type: PluginType;
  sidebar_opts?: {
    element_name: string;
    icon: string;
  };
  scripts: string[];
}
interface PluginInstance {
  name: string;
  type: string;
}

interface PluginRegistryMap {
  [s: string]: PluginInstance;
}

@Injectable()
export class PluginRegistryService {

  private registry: PluginRegistryMap = {};

  constructor(
    private http: HttpClient,
  ) {}

  add(key: string, pluginInstance: PluginInstance) {
    this.registry[key] = pluginInstance;
  }

  getPlugin(name: string, pluginSource = PluginSource.NPM) {
    debug.log('PLUGIN: ', name, pluginSource);
    const baseUrl = 'https://cdn.jsdelivr.net/npm/';
    const version = 'latest';
    const pluginBaseUrl = `${baseUrl}${name}@${version}/`;
    const manifestUrl = `${pluginBaseUrl}manifest.json`;
    // Get manifest file
    this.http.get(manifestUrl).subscribe((manifest: PluginManifest) => {
      debug.log('PLUGIN', manifest);

      if (manifest) {
        if (manifest.scripts && manifest.scripts.length) {
          debug.log('PLUGIN', manifest.scripts);

          return Promise.all(manifest.scripts.map(script => {
            return this.injectPluginScript(`${pluginBaseUrl}${script}`);
          })).then(() => {
            debug.log('PLUGIN', 'plugin scripts injected and loaded.');
          });
        }
      }
    });
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
