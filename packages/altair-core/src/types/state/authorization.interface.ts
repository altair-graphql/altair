import { IDictionary } from '../shared';

export const AUTHORIZATION_TYPES = {
  NONE: 'none',
  BASIC: 'basic',
  BEARER: 'bearer',
  API_KEY: 'api-key',
  OAUTH2: 'oauth2',
} as const;

export const AUTHORIZATION_TYPE_LIST = Object.values(AUTHORIZATION_TYPES);
export const DEFAULT_AUTHORIZATION_TYPE = AUTHORIZATION_TYPES.NONE;

export type AuthorizationTypes =
  (typeof AUTHORIZATION_TYPES)[keyof typeof AUTHORIZATION_TYPES];

interface AuthorizationTypeToData {
  [AUTHORIZATION_TYPES.NONE]: null;
  [AUTHORIZATION_TYPES.BASIC]: {
    username: string;
    password: string;
  };
  [AUTHORIZATION_TYPES.BEARER]: {
    token: string;
  };
  [AUTHORIZATION_TYPES.API_KEY]: {
    headerName: string;
    headerValue: string;
  };
  [AUTHORIZATION_TYPES.OAUTH2]: {
    token: string;
  };
}

export interface AuthorizationResult {
  headers: IDictionary<string>;
}

export interface AuthorizationState {
  type: AuthorizationTypes;
  data: unknown;
  result: AuthorizationResult;
}
