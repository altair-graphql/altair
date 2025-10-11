import { ICreateTeamDto, ReturnedTeamMembership } from '@altairgraphql/api-utils';
import {
  Component,
  EventEmitter,
  Output,
  computed,
  effect,
  input,
  signal,
  inject,
} from '@angular/core';
import { FormControl, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Team } from 'altair-graphql-core/build/types/state/account.interfaces';
import { AccountService, NotifyService } from '../../services';
import { debug } from '../../utils/logger';
import { getApiErrorCode, getErrorResponse } from '../../utils/errors';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import * as windowsMetaActions from '../../store/windows-meta/windows-meta.action';

@Component({
  selector: 'app-teams-dialog',
  templateUrl: './teams-dialog.component.html',
  styles: [],
  standalone: false,
})
export class TeamsDialogComponent {
  private readonly accountService = inject(AccountService);
  private readonly notifyService = inject(NotifyService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly store = inject<Store<RootState>>(Store);

  readonly teams = input<Team[]>();
  readonly showDialog = input(true);
  @Output() toggleDialogChange = new EventEmitter<boolean>();
  @Output() reloadTeamChange = new EventEmitter<string>();

  readonly teamName = computed(() => this.selectedTeam()?.name ?? '');
  readonly teamDescription = computed(() => this.selectedTeam()?.description ?? '');
  readonly membersOfSelectedTeam = signal(<ReturnedTeamMembership[]>[]);

  readonly selectedTeamId = signal<string | undefined>(undefined);

  readonly selectedTeam = computed(() => {
    const teams = this.teams();
    const selectedTeamId = this.selectedTeamId();
    if (!teams || teams.length === 0) {
      return undefined;
    }
    if (!selectedTeamId) {
      return teams[0];
    }
    return teams.find((t) => t.id === selectedTeamId);
  });
  readonly showTeamForm = signal(false);
  readonly editTeamId = signal<string | undefined>(undefined);
  teamForm = this.formBuilder.group({
    name: '',
    description: '',
  });

  readonly loading = signal(false);

  readonly showMemberForm = signal(false);
  readonly editUserId = signal<string | undefined>(undefined);
  memberForm = this.formBuilder.group({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
  });

  constructor() {
    effect(async () => {
      const selectedTeamId = this.selectedTeamId();
      if (!selectedTeamId) {
        this.membersOfSelectedTeam.set([]);
        return;
      }
      this.membersOfSelectedTeam.set(
        (await this.accountService.getTeamMembers(selectedTeamId)) || []
      );
    });

    effect(() => {
      const team = this.teams()?.find((t) => t.id === this.editTeamId());
      if (team) {
        this.teamForm.setValue({
          name: team.name,
          description: team.description ?? '',
        });
      }
    });
  }

  async onDeleteTeam(id: string) {
    if (confirm('Are you sure you want to delete this team?')) {
      await this.accountService.deleteTeam(id);
      this.reloadTeamChange.emit();
    }
  }

  onCreateTeam() {
    this.resetTeamForm();
    this.showTeamForm.set(true);
  }

  resetTeamForm() {
    this.editTeamId.set(undefined);
    this.teamForm.reset();
  }

  async onSubmitTeamForm() {
    try {
      this.loading.set(true);

      const teamDto: ICreateTeamDto = {
        name: this.teamForm.value.name ?? '',
        description: this.teamForm.value.description,
      };
      const editTeamId = this.editTeamId();

      if (editTeamId) {
        await this.accountService.updateTeam(editTeamId, teamDto);
      } else {
        await this.accountService.createTeam(teamDto);
      }

      this.resetTeamForm();
      this.reloadTeamChange.emit();
    } catch (err) {
      const rawError = await getErrorResponse(err);
      if (
        ['ERR_MAX_TEAM_MEMBER_COUNT', 'ERR_MAX_TEAM_COUNT'].includes(
          getApiErrorCode(rawError) ?? ''
        )
      ) {
        this.store.dispatch(
          new windowsMetaActions.ShowUpgradeDialogAction({ value: true })
        );
      }
      this.notifyService.errorWithError(rawError, 'Could not save team');
    } finally {
      this.loading.set(false);
    }
  }

  onEditTeamMember(userId: string) {
    const member = this.membersOfSelectedTeam().find((m) => m.userId === userId);
    if (member) {
      // TODO:
      // this.memberForm.setValue({
      //   name: team.name,
      //   description: team.description ?? '',
      // });
      this.showMemberForm.set(true);
      this.editUserId.set(userId);
    }
  }

  onAddTeamMember() {
    this.resetMemberForm();
    this.showMemberForm.set(true);
  }

  resetMemberForm() {
    this.editUserId.set(undefined);
    this.memberForm.reset();
  }

  async onSubmitMemberForm() {
    const selectedTeamId = this.selectedTeamId();
    if (!selectedTeamId) {
      debug.error('No selected team ID.');
      return;
    }

    try {
      this.loading.set(true);

      if (this.editUserId()) {
        // TODO: await this.accountService.updateTeamMember(this.editTeamId, teamDto);
        this.notifyService.error('Editing team members is not supported yet');
      } else {
        await this.accountService.createTeamMember({
          email: this.memberForm.value.email ?? '',
          teamId: selectedTeamId,
        });

        this.notifyService.success('Team member added');
      }

      this.resetMemberForm();
      this.reloadTeamChange.emit();
    } catch (err) {
      const rawError = await getErrorResponse(err);
      if (
        ['ERR_MAX_TEAM_MEMBER_COUNT', 'ERR_MAX_TEAM_COUNT'].includes(
          getApiErrorCode(rawError) ?? ''
        )
      ) {
        this.store.dispatch(
          new windowsMetaActions.ShowUpgradeDialogAction({ value: true })
        );
      }

      this.notifyService.errorWithError(rawError, 'Could not add team member');
    } finally {
      this.loading.set(false);
    }
  }

  trackById<T extends { id?: string }>(index: number, item: T) {
    return item.id;
  }
}
