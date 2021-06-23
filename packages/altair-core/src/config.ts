import { SubscriptionProviderIds, WEBSOCKET_PROVIDER_ID } from './subscriptions';
import { IDictionary } from './types/shared';
import { IInitialEnvironments } from './types/state/environments.interfaces';
import { HttpVerb } from './types/state/query.interfaces';
import { SettingsState } from './types/state/settings.interfaces';
import isElectron from './utils/is_electron';

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
   * Initial post-request script to be added
   */
  initialPostRequestScript?: string;

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
  initialSettings?: Partial<SettingsState>;

  /**
   * Initial subscriptions provider
   *
   * @default "websocket"
   */
  initialSubscriptionsProvider?: SubscriptionProviderIds;

  /**
   * Initial subscriptions connection params
   */
  initialSubscriptionsPayload?: IDictionary;

  /**
   * Indicates if the state should be preserved for subsequent app loads
   *
   * @default true
   */
  preserveState?: boolean;

  /**
   * HTTP method to use for making requests
   */
  initialHttpMethod?: HttpVerb;
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
  query_history_depth = isElectron ? 100 : 15;
  defaultTheme = 'system';
  themes = [ 'light', 'dark', 'dracula', 'system' ];
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
    postRequestScript: '',
    instanceStorageNamespace: 'altair_',
    settings: (undefined as unknown as AltairConfigOptions['initialSettings']),
    initialSubscriptionsProvider: undefined as AltairConfigOptions['initialSubscriptionsProvider'],
    initialSubscriptionsPayload: {} as IDictionary,
    initialHttpMethod: 'POST' as HttpVerb,
    preserveState: true,
  };
  constructor({
    endpointURL,
    subscriptionsEndpoint,
    initialQuery,
    initialHeaders,
    initialEnvironments,
    initialVariables,
    initialPreRequestScript,
    initialPostRequestScript = '',
    instanceStorageNamespace,
    initialSettings,
    initialSubscriptionsProvider = WEBSOCKET_PROVIDER_ID,
    initialSubscriptionsPayload = {},
    initialHttpMethod = 'POST',
    preserveState = true,
  }: AltairConfigOptions = {}) {
    this.initialData.url = (window as any).__ALTAIR_ENDPOINT_URL__ || endpointURL || '';
    this.initialData.subscriptionsEndpoint = (window as any).__ALTAIR_SUBSCRIPTIONS_ENDPOINT__ || subscriptionsEndpoint || '';
    this.initialData.query = (window as any).__ALTAIR_INITIAL_QUERY__ || initialQuery || '';
    this.initialData.variables = (window as any).__ALTAIR_INITIAL_VARIABLES__ || initialVariables || '';
    this.initialData.headers = (window as any).__ALTAIR_INITIAL_HEADERS__ || initialHeaders || '';
    this.initialData.environments = initialEnvironments || {};
    this.initialData.preRequestScript = (window as any).__ALTAIR_INITIAL_PRE_REQUEST_SCRIPT__ || initialPreRequestScript || '';
    this.initialData.postRequestScript = initialPostRequestScript;
    this.initialData.instanceStorageNamespace = (window as any).__ALTAIR_INSTANCE_STORAGE_NAMESPACE__ || instanceStorageNamespace || 'altair_';
    this.initialData.settings = initialSettings;
    this.initialData.initialSubscriptionsProvider = initialSubscriptionsProvider;
    this.initialData.initialSubscriptionsPayload = initialSubscriptionsPayload;
    this.initialData.initialHttpMethod = initialHttpMethod;
    this.initialData.preserveState = preserveState;
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
