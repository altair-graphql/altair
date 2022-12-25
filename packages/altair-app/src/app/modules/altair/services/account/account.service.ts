import { Injectable } from '@angular/core';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithCustomToken,
  signOut,
  User,
} from '@firebase/auth';
import { doc } from '@firebase/firestore';
import { createUtilsContext, getTeams } from 'altair-firebase-utils';
import { environment } from 'environments/environment';
import { from } from 'rxjs';
import { isElectronApp } from '../../utils';
import { ElectronAppService } from '../electron-app/electron-app.service';
import { firebaseClient, updateDocument, usersRef } from '../firebase/firebase';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private electronApp: ElectronAppService) {}

  private now() {
    return Date.now();
  }

  private async signin() {
    if (isElectronApp()) {
      const authToken = await this.electronApp.getAuthToken();
      return signInWithCustomToken(firebaseClient.auth, authToken);
    }

    const provider = new GoogleAuthProvider();
    return signInWithPopup(firebaseClient.auth, provider);
  }
  async accountLogin() {
    const cred = await this.signin();

    await updateDocument(doc(usersRef(), cred.user.uid), {
      name: cred.user.displayName || cred.user.email || '',
      email: cred.user.email || '',
      created_at: this.now(),
      updated_at: this.now(),
    });

    return cred;
  }

  accountLogin$() {
    return from(this.accountLogin());
  }

  async getUser() {
    if (!environment.serverReady) {
      return null;
    }

    return await firebaseClient.getUser();
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
    return getTeams(await this.ctx());
  }

  private async ctx() {
    const user = await this.mustGetUser();
    return createUtilsContext(user, firebaseClient.db);
  }
}
