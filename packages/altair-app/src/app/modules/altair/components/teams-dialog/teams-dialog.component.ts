import { ICreateTeamDto, ReturnedTeamMembership } from '@altairgraphql/api-utils';
import { Component, EventEmitter, Input, Output, input } from '@angular/core';
import { FormControl, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Team } from 'altair-graphql-core/build/types/state/account.interfaces';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
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
  @Input() set teams(val: Team[] | undefined) {
    if (val) {
      this.teams$.next(val);
    }
  }
  readonly showDialog = input(true);
  @Output() toggleDialogChange = new EventEmitter<boolean>();
  @Output() reloadTeamChange = new EventEmitter<string>();

  teamName = '';
  teamDescription = '';
  membersOfSelectedTeam: ReturnedTeamMembership[] = [];

  teams$ = new BehaviorSubject<Team[]>([]);
  selectedTeamId$ = new BehaviorSubject<string | undefined>(undefined);

  selectedTeam$ = combineLatest([this.teams$, this.selectedTeamId$]).pipe(
    map(([teams, selectedTeamId]) => {
      if (!selectedTeamId) {
        return teams[0];
      }
      return teams.find((t) => t.id === selectedTeamId);
    })
  );

  showTeamForm = false;
  editTeamId = '';
  teamForm = this.formBuilder.group({
    name: '',
    description: '',
  });

  loading = false;

  showMemberForm = false;
  editUserId = '';
  memberForm = this.formBuilder.group({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
  });

  constructor(
    private readonly accountService: AccountService,
    private readonly notifyService: NotifyService,
    private readonly formBuilder: NonNullableFormBuilder,
    private readonly store: Store<RootState>
  ) {
    this.selectedTeam$.subscribe(async (team) => {
      if (!team) {
        return;
      }
      this.teamName = team.name;
      this.teamDescription = team.description ?? '';

      this.membersOfSelectedTeam = await accountService.getTeamMembers(team.id);
    });
  }

  selectTeam(id?: string) {
    return this.selectedTeamId$.next(id);
  }

  async onDeleteTeam(id: string) {
    if (confirm('Are you sure you want to delete this team?')) {
      await this.accountService.deleteTeam(id);
      this.reloadTeamChange.emit();
    }
  }

  onCreateTeam() {
    this.resetTeamForm();
    this.showTeamForm = true;
  }
  onEditTeam(teamId: string) {
    this.teams$.subscribe((teams) => {
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        this.teamForm.setValue({
          name: team.name,
          description: team.description ?? '',
        });
        this.showTeamForm = true;
        this.editTeamId = teamId;
      }
    });
  }

  resetTeamForm() {
    this.editTeamId = '';
    this.teamForm.reset();
  }

  async onSubmitTeamForm() {
    try {
      this.loading = true;

      const teamDto: ICreateTeamDto = {
        name: this.teamForm.value.name ?? '',
        description: this.teamForm.value.description,
      };

      if (this.editTeamId) {
        await this.accountService.updateTeam(this.editTeamId, teamDto);
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
      this.loading = false;
    }
  }

  onEditTeamMember(userId: string) {
    const member = this.membersOfSelectedTeam.find((m) => m.userId === userId);
    if (member) {
      // TODO:
      // this.memberForm.setValue({
      //   name: team.name,
      //   description: team.description ?? '',
      // });
      this.showMemberForm = true;
      this.editUserId = userId;
    }
  }

  onAddTeamMember() {
    this.resetMemberForm();
    this.showMemberForm = true;
  }

  resetMemberForm() {
    this.editUserId = '';
    this.memberForm.reset();
  }

  async onSubmitMemberForm() {
    const selectedTeamId = await this.selectedTeamId$.pipe(take(1)).toPromise();
    if (!selectedTeamId) {
      debug.error('No selected team ID.');
      return;
    }

    try {
      this.loading = true;

      if (this.editUserId) {
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
      this.loading = false;
    }
  }

  trackById<T extends { id?: string }>(index: number, item: T) {
    return item.id;
  }
}
