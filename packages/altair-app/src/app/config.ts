import isElectron from './utils/is_electron';
import { IDictionary } from './interfaces/shared';
import { IInitialEnvironments } from './reducers/environments';
import * as fromSettings from './reducers/settings/settings';

const isTranslateMode = (window as any).__ALTAIR_TRANSLATE__;

export interface AltairConfigOptions {
  /**
   * URL to set as the server endpoint
   */
  endpointURL?: string;

  /**
   * URL to set as the subscription endpoint
   */
  subscriptionsEndpoint?: string;

  /**
   * Initial query to be added
   */
  initialQuery?: string;

  /**
   * Initial variables to be added
   */
  initialVariables?: string;

  /**
   * Initial pre-request script to be added
   */
  initialPreRequestScript?: string;

  /**
   * Initial headers object to be added
   * @example
   * {
   *  'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
   * }
   */
  initialHeaders?: IDictionary;

  /**
   * Initial Environments to be added
   * @example
   * {
   *   base: {
   *     title: 'Environment',
   *     variables: {}
   *   },
   *   subEnvironments: [
   *     {
   *       title: 'sub-1',
   *       variables: {}
   *     }
   *   ]
   * }
   */
  initialEnvironments?: IInitialEnvironments;

  /**
   * Namespace for storing the data for the altair instance.
   * Use this when you have multiple altair instances running on the same domain.
   * @example
   * instanceStorageNamespace: 'altair_dev_'
   */
  instanceStorageNamespace?: string;

  /**
   * Initial app settings to use
   */
  initialSettings?: Partial<fromSettings.State>;
}

export class AltairConfig {
  donation = {
    url: 'https://opencollective.com/altair/donate',
    action_count_threshold: 50
  };
  ga = 'UA-41432833-6';
  add_query_depth_limit = 3;
  tab_size = 2;
  max_windows = isElectron ? 50 : 15;
  default_language = isTranslateMode ? 'ach-UG' : 'en-US';
  languages = {
    'en-US': 'English',
    'fr-FR': 'French',
    'es-ES': 'Español',
    'cs-CZ': 'Czech',
    'de-DE': 'German',
    'pt-BR': 'Brazilian',
    'ru-RU': 'Russian',
    'uk-UA': 'Ukrainian',
    'zh-CN': 'Chinese Simplified',
    'ja-JP': 'Japanese',
    'sr-SP': 'Serbian',
    'it-IT': 'Italian',
    'pl-PL': 'Polish',
    'ko-KR': 'Korean',
    'ro-RO': 'Romanian',
    'vi-VN': 'Vietnamese',
  };
  query_history_depth = isElectron ? 50 : 7;
  defaultTheme = 'matchMedia' in window && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  themes: [ 'light', 'dark', 'dracula' ];
  isTranslateMode = isTranslateMode;
  isWebApp = (window as any).__ALTAIR_WEB_APP__;
  initialData = {
    url: '',
    subscriptionsEndpoint: '',
    query: '',
    variables: '',
    // Force type of header, since initial value inference is wrong
    headers: (null as unknown as IDictionary),
    environments: ({} as IInitialEnvironments),
    preRequestScript: '',
    instanceStorageNamespace: '',
    settings: (undefined as unknown as AltairConfigOptions['initialSettings']),
  };
  constructor({
    endpointURL,
    subscriptionsEndpoint,
    initialQuery,
    initialHeaders,
    initialEnvironments,
    initialVariables,
    initialPreRequestScript,
    instanceStorageNamespace,
    initialSettings,
  }: AltairConfigOptions = {}) {
    this.initialData.url = (window as any).__ALTAIR_ENDPOINT_URL__ || endpointURL || '';
    this.initialData.subscriptionsEndpoint = (window as any).__ALTAIR_SUBSCRIPTIONS_ENDPOINT__ || subscriptionsEndpoint || '';
    this.initialData.query = (window as any).__ALTAIR_INITIAL_QUERY__ || initialQuery || '';
    this.initialData.variables = (window as any).__ALTAIR_INITIAL_VARIABLES__ || initialVariables || '';
    this.initialData.headers = (window as any).__ALTAIR_INITIAL_HEADERS__ || initialHeaders || '';
    this.initialData.environments = initialEnvironments || {};
    this.initialData.preRequestScript = (window as any).__ALTAIR_INITIAL_PRE_REQUEST_SCRIPT__ || initialPreRequestScript || '';
    this.initialData.instanceStorageNamespace = (window as any).__ALTAIR_INSTANCE_STORAGE_NAMESPACE__ || instanceStorageNamespace || '';
    this.initialData.settings = initialSettings || undefined;
  }
}

let config = new AltairConfig();

export const setAltairConfig = (_config: AltairConfig) => {
  config = _config;
};

export const getAltairConfig = () => {
  return config;
};
(window as any).getAltairConfig = getAltairConfig;
