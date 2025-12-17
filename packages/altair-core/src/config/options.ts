import { input, output } from 'zod/v4';
import { altairConfigOptionsSchema } from './options.schema';
import { HTTP_HANDLER_ID, WEBSOCKET_HANDLER_ID } from '../request/ids';
import { httpVerbSchema } from '../types/state/query.schema';

export type AltairConfigOptions = input<typeof altairConfigOptionsSchema>;

const defaultOptions = {
  // initialEnvironments: {},
  initialPostRequestScript: '',
  initialSubscriptionRequestHandlerId: WEBSOCKET_HANDLER_ID,
  // initialSubscriptionsPayload: {},
  initialRequestHandlerId: HTTP_HANDLER_ID,
  initialRequestHandlerAdditionalParams: {},
  initialHttpMethod: httpVerbSchema.enum.POST,
  instanceStorageNamespace: 'altair_',
  preserveState: true,
  initialWindows: [],
  disableAccount: false,
  cspNonce: '',
} satisfies output<typeof altairConfigOptionsSchema>;

export function getOptions(opts: AltairConfigOptions) {
  const parsed = altairConfigOptionsSchema.parse(opts);
  return {
    ...defaultOptions,
    ...parsed,
  };
}
