import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { WORKSPACES } from 'altair-graphql-core/build/types/state/workspace.interface';
import { capitalize } from '../../utils';

export const getAccountState = (state: RootState) => state.account;
export const getTeams = createSelector(getAccountState, (data) => data.teams);
export const getWorkspaces = createSelector(getTeams, (teams) => {
  const defaultWorkspacesOptions = [
    {
      id: WORKSPACES.LOCAL,
      label: capitalize(WORKSPACES.LOCAL),
    },
    {
      id: WORKSPACES.REMOTE,
      label: capitalize(WORKSPACES.REMOTE),
    },
  ];

  // one workspace per team
  const teamOptions = teams.map((team) => ({
    id: team.id,
    label: `${capitalize(WORKSPACES.REMOTE)} - ${team.name}`,
  }));

  return [...defaultWorkspacesOptions, ...teamOptions];
});
