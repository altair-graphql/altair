import { readFileSync } from 'fs';
import yaml from 'yaml';
import log from './utils/logger.js';
import { findUp } from 'find-up';

export enum EXTENSION_TARGET {
  CHROME = 'chrome',
  MOZILLA = 'mozilla',
}

export const CONFIG_FILE_NAMES = ['cwex.yml', '.cwexrc'];

interface ManifestIconMap {
  16: string;
  48: string;
  128: string;
}
export type ManifestIcons = ManifestIconMap | string;

export interface ManifestBrowserAction {
  default_icon?: ManifestIcons;
  default_title?: string;
  default_popup?: string;
}

interface ManifestBackgroundOptions {
  scripts: string[];
}

interface ManifestSettingsOptions {
  page: string;
  open_in_tab: boolean;
}

type ManifestContentScriptRunAtOption =
  | 'document_idle'
  | 'document_start'
  | 'document_end';
export interface ManifestContentScriptOptions {
  matches: string[];
  css?: string[];
  js?: string[];
  match_about_blank?: boolean;
  exclude_matches?: string[];
  include_globs?: string[];
  exclude_globs?: string[];
  run_at?: ManifestContentScriptRunAtOption;
  all_frames?: boolean;
}

export interface ManifestBrowserSpecificSettings {
  gecko?: {
    id?: string;
    strict_min_version?: string;
    strict_max_version?: string;
    update_url?: string;
  };
}

export interface IDictionary<v = any> {
  [key: string]: v;
}

export interface ManifestOptions {
  version: string;
  name: string;
  short_name?: string;
  description?: string;

  /**
   * The extension's author, intended for display in the browser's user interface
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/author
   */
  author?: string;

  icons?: ManifestIcons;
  browser_action?: ManifestBrowserAction;
  page_action?: ManifestBrowserAction;

  /**
   * Use required permissions when they are needed for your extension’s basic functionality
   * https://developer.chrome.com/extensions/permissions
   */
  permissions?: string[];

  /**
   * Use optional permissions when they are needed for optional features in your extension
   * https://developer.chrome.com/extensions/permissions
   */
  optional_permissions?: string[];

  /**
   * specify the CSP for the extension
   * https://developer.chrome.com/extensions/contentSecurityPolicy
   */
  content_security_policy?: string;

  background?: ManifestBackgroundOptions;
  options_ui?: ManifestSettingsOptions;

  /**
   * whether the app or extension is expected to work offline
   * https://developer.chrome.com/extensions/manifest/offline_enabled
   */
  offline_enabled?: boolean;

  /**
   * override selected Chrome settings
   */
  chrome_settings_overrides?: IDictionary;

  /**
   * override selected Chrome user interface properties
   */
  chrome_ui_overrides?: IDictionary;

  /**
   * substitute an HTML file from your extension for a page that Google Chrome normally provides
   */
  chrome_url_overrides?: IDictionary;

  /**
   * add keyboard shortcuts that trigger actions in your extension
   */
  commands?: IDictionary;

  /**
   * content scripts are files that run in the context of web pages.
   * https://developer.chrome.com/extensions/content_scripts
   */
  content_scripts?: IDictionary<ManifestContentScriptOptions>;

  /**
   * Create a devtools extension
   */
  devtools_page?: string;

  /**
   * The URL of the homepage for this extension
   * https://developer.chrome.com/extensions/manifest/homepage_url
   */
  homepage_url?: string;

  /**
   * specify how this extension will behave if allowed to run in incognito mode
   * https://developer.chrome.com/extensions/manifest/incognito
   */
  incognito?: 'spanning' | 'split' | 'not_allowed';

  /**
   * the version of chrome that your extension requires
   * https://developer.chrome.com/extensions/manifest/minimum_chrome_version
   */
  minimum_chrome_version?: string;

  /**
   * allows you to register a keyword with Google Chrome's address bar
   * https://developer.chrome.com/extensions/omnibox
   */
  omnibox?: IDictionary;

  /**
   * https://developer.chrome.com/extensions/manifest/storage
   */
  storage?: IDictionary;

  /**
   * array of strings specifying the paths of packaged resources
   * that are expected to be usable in the context of a web page
   * https://developer.chrome.com/extensions/manifest/web_accessible_resources
   */
  web_accessible_resources?: IDictionary;

  /**
   * contains keys that are specific to a particular host application
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings
   */
  browser_specific_settings?: ManifestBrowserSpecificSettings;
}

export interface CwexConfig {
  /** array of glob matching patterns of files and directories */
  include: string[];

  /** array of regular expressions matching  files and directories to be excluded */
  exclude: string[];

  /** target browser extensions */
  targets: string[];

  /** root directory to find files and directories */
  rootDir: string;

  /** directory where the build would be compiled to */
  outDir: string;

  /** name of the file for the compiled extension */
  outFile?: string;

  /** path to script to execute before compiling extension */
  beforeCompile?: string;

  /** Manifest file options */
  manifestOptions?: chrome.runtime.ManifestV3;

  /** Config options specific to a target e.g. chrome: { include, exclude, etc } */
  targetOptions?: { [key: string]: CwexConfig };
}

export interface ExtensionInfo {
  content: string;
  fileName: string;
  fileType: string;
}

export type ExtensionInfoGenerator = (config: CwexConfig) => Promise<ExtensionInfo>;

export interface ExtensionCompilerOption {
  extensionFilesDir: string;
  extensionBuildOutputDir: string;
  config: CwexConfig;
}

export type ExtensionCompiler = (opts: ExtensionCompilerOption) => Promise<boolean>;

export const defaultConfig: CwexConfig = {
  include: [],
  exclude: [],
  targets: [...Object.values(EXTENSION_TARGET)],
  rootDir: './',
  outDir: 'out',
};

export const getConfigFile = async () => {
  return findUp(CONFIG_FILE_NAMES);
};

export const getConfig = async (configPath = '') => {
  const pathToConfig = configPath ? configPath : await getConfigFile();
  let config = { ...defaultConfig };
  if (pathToConfig) {
    log('Config file found:', pathToConfig);
    try {
      config = { ...config, ...yaml.parse(readFileSync(pathToConfig, 'utf8')) };
    } catch (err) {
      log('The config file is invalid. Check that you have a valid YAML file.');
      throw err;
    }
  } else {
    log('Config file not found.');
  }

  return config;
};
