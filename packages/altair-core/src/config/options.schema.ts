import { array, boolean, object, record, string, unknown } from 'zod/v4';
import { requestHandlerIdsSchema } from '../request/schemas';
import { httpVerbSchema } from '../types/state/query.schema';
import { authorizationProviderInputSchemas } from '../authorization/input';
import { initialEnvironmentsSchema } from '../types/state/environments.schema';
import {
  partialSettingsSchema,
  settingsSchema,
} from '../types/state/settings.schema';

export const altairWindowOptionsSchema = object({
  /**
   * Initial name of the window
   */
  initialName: string()
    .meta({ description: 'Initial name of the window' })
    .optional(),

  /**
   * URL to set as the server endpoint
   */
  endpointURL: string()
    .meta({ description: 'URL to set as the server endpoint' })
    .optional(),

  /**
   * URL to set as the subscription endpoint. This can be relative or absolute.
   */
  subscriptionsEndpoint: string()
    .meta({
      description:
        'URL to set as the subscription endpoint. This can be relative or absolute.',
    })
    .optional(),

  /**
   * URL protocol for the subscription endpoint. This is used if the specified subscriptions endpoint is relative. e.g. wss
   */
  subscriptionsProtocol: string()
    .meta({
      description:
        'URL protocol for the subscription endpoint. This is used if the specified subscriptions endpoint is relative. e.g. wss',
    })
    .optional(),

  /**
   * Initial query to be added
   */
  initialQuery: string()
    .meta({ description: 'Initial query to be added' })
    .optional(),

  /**
   * Initial variables to be added
   */
  initialVariables: string()
    .meta({ description: 'Initial variables to be added' })
    .optional(),

  /**
   * Initial pre-request script to be added
   */
  initialPreRequestScript: string()
    .meta({ description: 'Initial pre-request script to be added' })
    .optional(),

  /**
   * Initial post-request script to be added
   */
  initialPostRequestScript: string()
    .meta({ description: 'Initial post-request script to be added' })
    .optional(),

  /**
   * Initial headers object to be added
   * @example
   * {
   *  'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
   * }
   */
  initialHeaders: record(string(), unknown())
    .meta({
      description: 'Initial headers object to be added',
      example: `
        {
          "X-GraphQL-Token": "asd7-237s-2bdk-nsdk4"
        }
        `,
    })
    .optional(),

  /**
   * Initial subscriptions provider
   *
   * @default "websocket"
   */
  initialSubscriptionRequestHandlerId: requestHandlerIdsSchema
    .meta({ description: 'Initial subscriptions provider' })
    .optional(),

  /**
   * Initial subscriptions connection params
   */
  initialSubscriptionsPayload: record(string(), unknown())
    .meta({ description: 'Initial subscriptions connection params' })
    .optional()
    .nullable(),

  /**
   * Initial request handler id
   * @default "http"
   */
  initialRequestHandlerId: requestHandlerIdsSchema
    .meta({
      description: 'Initial request handler id',
    })
    .optional(),

  /**
   * Additional params to be passed to the request handler
   */
  initialRequestHandlerAdditionalParams: record(string(), unknown())
    .meta({ description: 'Additional params to be passed to the request handler' })
    .optional(),

  /**
   * Initial HTTP method to use for making requests
   */
  initialHttpMethod: httpVerbSchema
    .meta({ description: 'HTTP method to use for making requests' })
    .optional(),

  /**
   * Initial authorization type and data
   */
  initialAuthorization: authorizationProviderInputSchemas
    .meta({ description: 'Initial authorization type and data' })
    .optional(),
});

export const altairConfigOptionsSchema = altairWindowOptionsSchema.extend({
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
  initialEnvironments: initialEnvironmentsSchema
    .meta({
      description: 'Initial Environments to be added',
      example: `
      {
        activeSubEnvironment: 'sub-1'
        base: {
          title: 'Environment',
          variables: {}
        },
        subEnvironments: [
          {
            title: 'sub-1',
            variables: {}
          }
        ]
      }
      `,
    })
    .optional(),

  /**
   * Namespace for storing the data for the altair instance.
   * Use this when you have multiple altair instances running on the same domain.
   * @example
   * instanceStorageNamespace: 'altair_dev_'
   */
  instanceStorageNamespace: string()
    .meta({
      description:
        'Namespace for storing the data for the altair instance. Use this when you have multiple altair instances running on the same domain.',
    })
    .optional(),

  /**
   * Initial app settings to use
   */
  initialSettings: settingsSchema
    .partial()
    .meta({ description: 'Initial app settings to use' })
    .optional()
    .nullable(),

  /**
   * Indicates if the state should be preserved for subsequent app loads
   *
   * @default true
   */
  preserveState: boolean()
    .meta({
      description:
        'Indicates if the state should be preserved for subsequent app loads',
    })
    .optional(),

  /**
   * List of options for windows to be loaded
   */
  initialWindows: array(altairWindowOptionsSchema)
    .meta({ description: 'List of options for windows to be loaded' })
    .optional(),

  /**
   * Persisted settings for the app. The settings will be merged with the app settings.
   */
  persistedSettings: partialSettingsSchema
    .meta({
      description:
        'Persisted settings for the app. The settings will be merged with the app settings.',
    })
    .optional(),

  /**
   * Disable the account and remote syncing functionality
   */
  disableAccount: boolean()
    .meta({
      description: 'Disable the account and remote syncing functionality',
    })
    .optional(),

  /**
   * CSP nonce value to be used in Altair
   */
  cspNonce: string()
    .meta({ description: 'CSP nonce value to be used in Altair' })
    .optional(),
});
