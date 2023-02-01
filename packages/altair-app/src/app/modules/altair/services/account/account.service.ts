import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { from } from 'rxjs';
import { isElectronApp } from '../../utils';
import { apiClient } from '../api/api.service';
import { ElectronAppService } from '../electron-app/electron-app.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private electronApp: ElectronAppService) {}

  private async signin() {
    if (isElectronApp()) {
      const authToken = await this.electronApp.getAuthToken();
      return apiClient.signInWithCustomToken(authToken);
    }

    return apiClient.signinWithPopup();
  }
  async accountLogin() {
    return this.signin();
  }

  accountLogin$() {
    return from(this.accountLogin());
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
    return apiClient.signOut();
  }

  async isUserSignedIn() {
    return !!(await this.getUser());
  }

  async getTeams() {
    return apiClient.getTeams();
  }
}
