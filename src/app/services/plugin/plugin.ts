
export enum PluginSource {
  NPM = 'npm',
  GITHUB = 'github'
}
export enum PluginType {
  SIDEBAR = 'sidebar',
}
export interface PluginSidebarOptions {
  element_name: string;
  icon: string;
}
export interface PluginManifest {
  manifest_version: number;
  name: string;
  display_name: string;
  version: string;
  description: string;
  author_email?: string;
  author?: string;
  type: PluginType;
  sidebar_opts?: PluginSidebarOptions;
  scripts: string[];
}
export interface PluginInstance {
  name: string;
  display_name: string;
  type: PluginType;
  sidebar_opts: PluginSidebarOptions;
  props?: any;
  context?: any;
  isActive: boolean;
  manifest: PluginManifest;
}

export interface PluginRegistryMap {
  [s: string]: PluginInstance;
}

export class AltairPlugin implements PluginInstance {
  type = PluginType.SIDEBAR;
  sidebar_opts: PluginSidebarOptions;
  isActive = false;
  props;
  context;
  display_name = '';
  constructor(public name: string, public manifest: PluginManifest) {
    this.sidebar_opts = manifest.sidebar_opts;
    this.type = manifest.type;
    this.display_name = manifest.display_name || name;
  }
}
