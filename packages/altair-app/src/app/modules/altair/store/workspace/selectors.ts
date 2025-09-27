import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { WORKSPACES } from 'altair-graphql-core/build/types/state/workspace.interface';
import { capitalize } from '../../utils';
import { selectTeams } from '../account/selectors';

export interface WorkspaceOption {
  id: string;
  label: string;
  teamId?: string;
}

export const selectWorkspacesState = (state: RootState) => state.workspaces;
export const selectWorkspaceList = createSelector(
  selectWorkspacesState,
  (workspacesState) => workspacesState.list || []
);
export const getWorkspaces = createSelector(
  selectWorkspaceList,
  selectTeams,
  (workspaces, teams): WorkspaceOption[] => {
    const defaultWorkspacesOptions = [
      {
        id: WORKSPACES.LOCAL,
        label: capitalize(WORKSPACES.LOCAL),
      },
    ];

    return [
      ...defaultWorkspacesOptions,
      ...workspaces.map((w) => ({
        id: w.id,
        label: w.name,
        teamId: w.teamId,
      })),
    ];
  }
);
