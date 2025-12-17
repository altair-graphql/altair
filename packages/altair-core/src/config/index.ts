import { isExtension } from '../crx';
import { TODO } from '../types/shared';
import isElectron from '../utils/is_electron';
import { ConfigEnvironment } from './environment';
import { getOptions } from './options';
import { UrlConfig, urlMap } from './urls';
import { altairConfigOptionsSchema } from './options.schema';
import { input } from 'zod/v4';
import { DEFAULT_OPTIONS } from './defaults';
import { languagesSchema } from './languages';

const parseUrl = (url: string) => {
  try {
    return new URL(url);
  } catch (e) {
    return;
  }
};

export const isTranslateMode = (window as TODO).__ALTAIR_TRANSLATE__;

export class AltairConfig {
  private localSandboxUrl: string | undefined;
  private useLocalSandboxUrl = false;
  donation = {
    url: 'https://opencollective.com/altair/donate',
    action_count_threshold: 50,
  };
  ga = 'UA-41432833-6';
  add_query_depth_limit = DEFAULT_OPTIONS.ADD_QUERY_DEPTH_LIMIT;
  tab_size = DEFAULT_OPTIONS.TAB_SIZE;
  max_windows = isElectron ? 50 : 15;
  default_language = isTranslateMode
    ? languagesSchema.enum.TranslationLang
    : DEFAULT_OPTIONS.DEFAULT_LANGUAGE;
  query_history_depth = isElectron ? 100 : 15;
  disableLineNumbers = false;
  defaultTheme = DEFAULT_OPTIONS.DEFAULT_THEME;
  themes = DEFAULT_OPTIONS.THEMES;
  isTranslateMode = isTranslateMode;
  isWebApp = (window as TODO).__ALTAIR_WEB_APP__;
  cspNonce = '';
  // assigning options here to get the return type
  options = getOptions({});

  constructor(options: input<typeof altairConfigOptionsSchema> = {}) {
    this.options = getOptions(options);
    this.options.endpointURL =
      (window as TODO).__ALTAIR_ENDPOINT_URL__ ?? this.options.endpointURL ?? '';
    this.options.subscriptionsEndpoint =
      (window as TODO).__ALTAIR_SUBSCRIPTIONS_ENDPOINT__ ??
      this.options.subscriptionsEndpoint ??
      '';
    this.options.initialQuery =
      (window as TODO).__ALTAIR_INITIAL_QUERY__ ?? this.options.initialQuery ?? '';
    this.options.initialVariables =
      (window as TODO).__ALTAIR_INITIAL_VARIABLES__ ??
      this.options.initialVariables ??
      '';
    this.options.initialHeaders =
      (window as TODO).__ALTAIR_INITIAL_HEADERS__ ??
      this.options.initialHeaders ??
      {};
    this.options.initialPreRequestScript =
      (window as TODO).__ALTAIR_INITIAL_PRE_REQUEST_SCRIPT__ ??
      this.options.initialPreRequestScript ??
      '';
    this.options.instanceStorageNamespace =
      (window as TODO).__ALTAIR_INSTANCE_STORAGE_NAMESPACE__ ??
      this.options.instanceStorageNamespace ??
      'altair_';

    this.cspNonce = this.options.cspNonce ?? '';
  }

  private getPossibleLocalSandBoxRoot() {
    if (isExtension) {
      // we only support mv3 extensions now
      // and mv3 extensions doesn't allow using iframe
      // sandbox with allow-same-origin so we have to open up
      // the postMessage without origin verification
      // This doesn't sit well with me, so for now we don't
      // support local sandbox for extensions.
      // We can revisit this later if needed.
      return;
    }
    // check document base url
    if (
      document.baseURI &&
      parseUrl(document.baseURI)?.origin === window.location.origin
    ) {
      // add iframe-sandbox path to base url
      if (document.baseURI.endsWith('/')) {
        return new URL(document.baseURI + 'iframe-sandbox');
      } else {
        // remove the last part of the url
        return new URL(
          document.baseURI.slice(0, document.baseURI.lastIndexOf('/') + 1) +
            'iframe-sandbox'
        );
      }
    }
  }

  private async getLocalSandBoxUrl() {
    if (typeof this.localSandboxUrl === 'undefined') {
      const localSandboxRoot = this.getPossibleLocalSandBoxRoot()?.href ?? '';
      if (localSandboxRoot) {
        this.localSandboxUrl = localSandboxRoot + '/index.html';
        const localSandboxTestUrl = localSandboxRoot + '/sandbox.png';
        const res = await fetch(localSandboxTestUrl);
        if (res.ok) {
          this.useLocalSandboxUrl = true;
        }
      }
    }

    if (this.useLocalSandboxUrl) {
      return this.localSandboxUrl;
    }
  }

  getUrlConfig(environment: ConfigEnvironment = 'production'): UrlConfig {
    return urlMap[environment];
  }
  async getUrlConfigWithLocal(
    environment: ConfigEnvironment = 'production'
  ): Promise<UrlConfig> {
    // Check for local sandbox url first
    const localSandboxUrl = await this.getLocalSandBoxUrl();

    const urls = urlMap[environment];
    if (localSandboxUrl) {
      urls.sandbox = localSandboxUrl;
    }
    return urls;
  }

  async getUrl(
    name: keyof UrlConfig,
    environment: ConfigEnvironment = 'production'
  ) {
    const urlConfig = await this.getUrlConfigWithLocal(environment);
    return urlConfig[name];
  }
}

let config = new AltairConfig();

export const setAltairConfig = (_config: AltairConfig) => {
  config = _config;
};

export const getAltairConfig = () => {
  return config;
};
(window as TODO).getAltairConfig = getAltairConfig;
