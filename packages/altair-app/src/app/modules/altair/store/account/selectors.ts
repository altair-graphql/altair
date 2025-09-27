import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

export const selectAccountState = (state: RootState) => state.account;
export const selectTeams = createSelector(selectAccountState, (data) => data.teams);
