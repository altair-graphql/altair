import { Injectable } from '@angular/core';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithCustomToken,
  signOut,
  User,
  signInWithCredential,
} from '@firebase/auth';
import { doc } from '@firebase/firestore';
import {
  createUtilsContext,
  getTeams,
  usersRef,
} from '@altairgraphql/firebase-utils';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { isElectronApp, isFirefoxExtension } from '../../utils';
import { ElectronAppService } from '../electron-app/electron-app.service';
import { firebaseClient, updateDocument } from '../firebase/firebase';

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

    const oauthClientId =
      '584169952184-t8ma7o379v9e2v0pptb47qrg2q9biehh.apps.googleusercontent.com';
    if (isFirefoxExtension) {
      const nonce = Math.floor(Math.random() * 1000);
      const responseUrl = await browser.identity.launchWebAuthFlow({
        url: `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&nonce=${nonce}&scope=openid%20profile&client_id=${oauthClientId}&redirect_uri=${browser.identity.getRedirectURL()}`,
        interactive: true,
      });
      // Parse the response url for the id token
      const idToken = responseUrl.split('id_token=')[1]?.split('&')[0];

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(firebaseClient.auth, credential);
    }

    const provider = new GoogleAuthProvider();
    return signInWithPopup(firebaseClient.auth, provider);
  }
  async accountLogin() {
    const cred = await this.signin();

    await updateDocument(doc(usersRef(firebaseClient.db), cred.user.uid), {
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
