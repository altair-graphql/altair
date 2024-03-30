import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';

export const getAuthorizationState = (state: PerWindowState) =>
  state.authorization;
