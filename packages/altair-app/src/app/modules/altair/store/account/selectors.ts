import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { WORKSPACES } from 'altair-graphql-core/build/types/state/workspace.interface';
import { capitalize } from '../../utils';

export const getAccountState = (state: RootState) => state.account;
export const getTeams = createSelector(getAccountState, (data) => data.teams);
