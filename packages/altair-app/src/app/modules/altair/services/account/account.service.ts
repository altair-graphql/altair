import { Injectable } from '@angular/core';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithCustomToken,
  signOut,
} from '@firebase/auth';
import { doc } from '@firebase/firestore';
import {
  createUtilsContext,
  getTeams,
  usersRef,
} from '@altairgraphql/firebase-utils';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { isElectronApp, isExtension } from '../../utils';
import { ElectronAppService } from '../electron-app/electron-app.service';
import { firebaseClient, updateDocument } from '../firebase/firebase';
import { OAUTH_POPUP_CALLBACK_MESSAGE_TYPE } from '@altairgraphql/firebase-utils/build/constants';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private electronApp: ElectronAppService) {}

  private now() {
    return Date.now();
  }

  private nonce() {
    const validChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let array = new Uint8Array(40);
    crypto.getRandomValues(array);
    array = array.map((x) => validChars.charCodeAt(x % validChars.length));
    return String.fromCharCode(...array);
  }

  private getPopupUrl(nonce: string) {
    const url = new URL(environment.authPopupUrl);
    url.searchParams.append('nonce', nonce);
    url.searchParams.append('source', location.origin);

    return url.href;
  }

  private async getTokenFromPopup() {
    const nonce = this.nonce();
    const popup = window.open(this.getPopupUrl(nonce), 'Altair GraphQL');
    if (!popup) {
      throw new Error('Could not create signin popup!');
    }
    // TODO: set timeout
    return new Promise<string>((resolve, reject) => {
      const listener = (message: MessageEvent) => {
        try {
          const type = message?.data?.type;
          if (type === OAUTH_POPUP_CALLBACK_MESSAGE_TYPE) {
            if (
              new URL(message.origin).href !==
              new URL(environment.authPopupUrl).href
            ) {
              return reject(new Error('origin does not match!'));
            }

            // Verify returned nonce
            if (nonce !== message?.data?.payload?.nonce) {
              window.removeEventListener('message', listener);
              return reject(new Error('nonce does not match!'));
            }

            const token = message?.data?.payload?.token;
            window.removeEventListener('message', listener);
            return resolve(token);
          }
        } catch (err) {
          reject(err);
        }
      };

      window.addEventListener('message', listener);
    });
  }

  private async signin() {
    if (isElectronApp()) {
      const authToken = await this.electronApp.getAuthToken();
      return signInWithCustomToken(firebaseClient.auth, authToken);
    }

    if (isExtension) {
      const token = await this.getTokenFromPopup();
      return signInWithCustomToken(firebaseClient.auth, token);
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
