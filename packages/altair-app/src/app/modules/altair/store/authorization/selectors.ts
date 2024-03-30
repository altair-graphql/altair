import {
  AUTHORIZATION_TYPES,
  AuthorizationState,
} from 'altair-graphql-core/build/types/state/authorization.interface';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';

export const getAuthorizationState = (state: PerWindowState) => state.authorization;

export const isAuthorizationEnabled = (authorizationState: AuthorizationState) =>
  authorizationState.type &&
  authorizationState.type != AUTHORIZATION_TYPES.NONE &&
  authorizationState.data;
