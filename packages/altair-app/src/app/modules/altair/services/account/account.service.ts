import { ICreateTeamDto, ICreateTeamMembershipDto } from '@altairgraphql/api-utils';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { EMPTY, from } from 'rxjs';
import { isElectronApp } from '../../utils';
import { apiClient } from '../api/api.service';
import { ElectronAppService } from '../electron-app/electron-app.service';
import { IdentityProvider } from '@altairgraphql/db';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private electronApp = inject(ElectronAppService);


  private async signin(provider: IdentityProvider = IdentityProvider.GOOGLE) {
    if (isElectronApp()) {
      const authToken = await this.electronApp.getAuthToken();
      return apiClient.signInWithCustomToken(authToken);
    }

    return apiClient.signinWithPopup(provider);
  }
  async accountLogin(provider: IdentityProvider = IdentityProvider.GOOGLE) {
    return this.signin(provider);
  }

  accountLogin$(provider: IdentityProvider = IdentityProvider.GOOGLE) {
    return from(this.accountLogin(provider));
  }

  observeUser() {
    if (!environment.serverReady) {
      return EMPTY;
    }

    return apiClient.observeUser();
  }

  async getUser() {
    if (!environment.serverReady) {
      return null;
    }

    return await apiClient.getUser();
  }

  async mustGetUser() {
    const user = await this.getUser();
    if (!user) {
      throw new Error(
        'User was expected but is undefined. Ensure you are logged in.'
      );
    }

    return user;
  }

  async logout() {
    return await apiClient.signOut();
  }

  async isUserSignedIn() {
    return !!(await this.getUser());
  }

  async getTeams() {
    return apiClient.getTeams();
  }

  async createTeam(input: ICreateTeamDto) {
    return apiClient.createTeam(input);
  }

  async updateTeam(teamId: string, input: Partial<ICreateTeamDto>) {
    return apiClient.updateTeam(teamId, input);
  }

  async deleteTeam(teamId: string) {
    return apiClient.deleteTeam(teamId);
  }

  async getTeamMembers(teamId: string) {
    return apiClient.getTeamMembers(teamId);
  }

  async createTeamMember(input: ICreateTeamMembershipDto) {
    return apiClient.addTeamMember(input);
  }

  async getWorkspaces() {
    return apiClient.getWorkspaces();
  }

  async getStats() {
    return apiClient.getUserStats();
  }

  async getPlan() {
    return await apiClient.getUserPlan();
  }

  async getPlanInfos() {
    return await apiClient.getPlanInfos();
  }

  async getAvailableCredits() {
    return await apiClient.getAvailableCredits();
  }

  async getUpgradeProUrl() {
    return await apiClient.getUpgradeProUrl();
  }
}
