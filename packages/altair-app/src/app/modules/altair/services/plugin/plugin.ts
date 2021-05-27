import uuid from 'uuid/v4';
import { PluginContextService } from './context/plugin-context.service';

/**
 * Defines the repository of the plugin.
 * Used to know where to get the plugin from.
 */
export enum PluginSource {
  NPM = 'npm',
  GITHUB = 'github',
  URL = 'url',
}

/**
 * Specifies the type of the plugin.
 * Determines how the plugin would interact with Altair.
 */
export enum PluginType {
  HEADER = 'header',
  SIDEBAR = 'sidebar',
  ACTION_BUTTON = 'action_button',
}

/**
 * Specifies the capabilities (functionalities) available to the plugin.
 * In the future, this would be used to request the necessary permissions from the user.
 */
export type PluginCapabilities =
  | 'query:read'
  | 'query:write'
  | 'header:read'
  | 'header:write'
  | 'environment:read'
  | 'environment:write'
  ;

/**
 * Plugin Manifest Structure
 */
export interface PluginManifest {
  // Version of manifest. Should be 1 or 2.
  manifest_version: number;
  name: string;
  display_name: string;
  version: string;
  description: string;
  author_email?: string;
  author?: string;
  type?: PluginType;
  plugin_class?: string;
  scripts: string[];
  styles?: string[];
  // Plugin capabilities
  capabilities?: PluginCapabilities[];
}

export interface AltairPlugin {
  name: string;
  display_name: string;
  capabilities: PluginCapabilities[];
  type?: PluginType;
  plugin_class?: string;
  manifest: PluginManifest;
}

export const createPlugin = (name: string, manifest: PluginManifest): AltairPlugin => {
  return {
    name,
    manifest,
    type: manifest.type,
    display_name: manifest.display_name || name,
    plugin_class: manifest.plugin_class,
    capabilities: Array.from(new Set([ ...(manifest.capabilities || []), ...([ 'query:read', 'query:write' ] as PluginCapabilities[]) ])),
  };
};

export type PluginContext = ReturnType<PluginContextService['createContext']>;

export type PluginClass = new() => PluginClassInstance;

/**
 * We should have plugin instance extend to SidebarPanel, ResultAction, HeaderPanel, UiTheme
 */
export interface PluginClassInstance {
  initialize(ctx: PluginContext): void;
  destroy(): void;
}

export enum AltairPanelLocation {
  HEADER = 'header',
  SIDEBAR = 'sidebar',
}

export enum AltairUiActionLocation {
  RESULT_PANE = 'result_pane',
}

/**
 * Used for dynamic panel elements. Can also be used for angular components in the future.
 */
export class AltairPanel {
  public id = uuid();
  public isActive = false;

  constructor(
    public title: string,
    public element: HTMLElement,
    public location: AltairPanelLocation,
  ) {}

  destroy() {
    this.element = null as unknown as HTMLElement;
  }
}

export class AltairUiAction {
  public id = uuid();

  constructor(
    public title: string,
    public location: AltairUiActionLocation,
    public callback: () => void,
  ) {}

  execute() {
    this.callback();
  }
}
