import { AuthorizationProviderInput } from '../authorization/input';
import { RequestHandlerIds } from '../request/types';
import { IDictionary } from '../types/shared';
import { IInitialEnvironments } from '../types/state/environments.interfaces';
import { HttpVerb } from '../types/state/query.interfaces';
import { SettingsState } from '../types/state/settings.interfaces';

export interface AltairWindowOptions {
  /**
   * Initial name of the window
   */
  initialName?: string;

  /**
   * URL to set as the server endpoint
   */
  endpointURL?: string;

  /**
   * URL to set as the subscription endpoint. This can be relative or absolute.
   */
  subscriptionsEndpoint?: string;

  /**
   * URL protocol for the subscription endpoint. This is used if the specified subscriptions endpoint is relative.
   * e.g. wss
   */
  subscriptionsProtocol?: string;

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
   * Initial subscriptions provider
   *
   * @default "websocket"
   */
  initialSubscriptionRequestHandlerId?: RequestHandlerIds;

  /**
   * Initial subscriptions connection params
   */
  initialSubscriptionsPayload?: IDictionary;

  /**
   * Initial request handler id
   *
   * @default "http"
   */
  initialRequestHandlerId?: RequestHandlerIds;

  /**
   * Additional params to be passed to the request handler
   */
  initialRequestHandlerAdditionalParams?: Record<string, unknown>;

  /**
   * HTTP method to use for making requests
   */
  initialHttpMethod?: HttpVerb;

  /**
   * Initial authorization type and data
   */
  initialAuthorization?: AuthorizationProviderInput;
}

export interface AltairConfigOptions extends AltairWindowOptions {
  /**
   * Initial Environments to be added
   * @example
   * {
   *   activeSubEnvironment: 'sub-1'
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
   * Indicates if the state should be preserved for subsequent app loads
   *
   * @default true
   */
  preserveState?: boolean;

  /**
   * List of options for windows to be loaded
   */
  initialWindows?: AltairWindowOptions[];

  /**
   * Persisted settings for the app. The settings will be merged with the app settings.
   */
  persistedSettings?: Partial<SettingsState>;

  /**
   * Disable the account and remote syncing functionality
   */
  disableAccount?: boolean;

  /**
   * CSP nonce value to be used in Altair
   */
  cspNonce?: string;
}
