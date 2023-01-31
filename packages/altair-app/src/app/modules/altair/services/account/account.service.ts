import { Injectable } from '@angular/core';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithCustomToken,
  signOut,
} from '@firebase/auth';
import { doc } from '@firebase/firestore';
import { createUtilsContext } from '@altairgraphql/firebase-utils';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { isElectronApp, isExtension } from '../../utils';
import { ElectronAppService } from '../electron-app/electron-app.service';
import { firebaseClient, updateDocument } from '../firebase/firebase';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private electronApp: ElectronAppService) {}

  private async signin() {
    if (isElectronApp()) {
      const authToken = await this.electronApp.getAuthToken();
      return firebaseClient.apiClient.signInWithCustomToken(authToken);
    }

    return firebaseClient.apiClient.signinWithPopup();
  }
  async accountLogin() {
    return this.signin();
  }

  accountLogin$() {
    return from(this.accountLogin());
  }
  observeSignout() {
    return new Observable((sub) => {
      onAuthStateChanged(firebaseClient.auth, (user) => {
        if (!user) {
          sub.next(true);
        }
      });
    });
  }

  async getUser() {
    if (!environment.serverReady) {
      return null;
    }

    return await firebaseClient.apiClient.getUser();
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
    return signOut(firebaseClient.auth);
  }

  async isUserSignedIn() {
    return !!(await this.getUser());
  }

  async getTeams() {
    return firebaseClient.apiClient.getTeams();
  }
}
