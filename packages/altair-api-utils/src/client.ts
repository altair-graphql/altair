import { APIClientOptions, ClientEnvironment, getClientConfig } from './config';
import {
  ALTAIR_API_USER_TOKEN_STORAGE_KEY,
  OAUTH_POPUP_CALLBACK_MESSAGE_TYPE,
} from './constants';
import ky from 'ky';
import { KyInstance } from 'ky/distribution/types/ky';
import {
  ICreateQueryCollectionDto,
  ICreateQueryDto,
  IUpdateQueryCollectionDto,
  IUpdateQueryDto,
} from './query';
import {
  QueryItem,
  QueryCollection,
  Team,
  TeamMembership,
  TeamMemberRole,
} from '@altairgraphql/db';
import { IUserProfile, IUserStats } from './user';
import {
  ICreateTeamDto,
  ICreateTeamMembershipDto,
  IUpdateTeamDto,
} from './team';
import { from, Observable, Subject } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
export type FullQueryCollection = QueryCollection & {
  queries: QueryItem[];
};
export type ReturnedTeamMembership = TeamMembership & {
  user: Pick<IUserProfile, 'firstName' | 'lastName' | 'email'>;
};

const SignInTimeout = 15 * 60 * 1000; // 15m

const timeout = <T>(
  prom: Promise<T>,
  time: number,
  exception = new Error('timeout exceeded!')
) => {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    prom,
    new Promise<T>((_r, rej) => (timer = setTimeout(rej, time, exception))),
  ]).finally(() => clearTimeout(timer));
};

export class APIClient {
  ky: KyInstance;
  authToken?: string;

  user$ = new Subject<IUserProfile>();
  private _user?: IUserProfile;
  get user() {
    return this._user;
  }
  set user(val) {
    this._user = val;
    this.user$.next(val);
  }

  constructor(public options: APIClientOptions) {
    this.ky = ky.extend({
      prefixUrl: options.apiBaseUrl,
      hooks: {
        beforeRequest: [req => this.setAuthHeaderBeforeRequest(req)],
      },
    });

    this.checkCachedUser();
  }

  private async checkCachedUser() {
    if (this.user) {
      // No need to do anything if the user is already set
      return;
    }
    // Check for user access token in local storage
    const cachedToken = this.getCachedToken();
    if (cachedToken) {
      return this.signInWithCustomToken(cachedToken).catch(() => {
        this.signOut();
      });
    }
    this.user = undefined;
  }

  private setCachedToken(token: string) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ALTAIR_API_USER_TOKEN_STORAGE_KEY, token);
    }
  }
  private getCachedToken() {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(ALTAIR_API_USER_TOKEN_STORAGE_KEY);
    }
  }
  private clearCachedToken() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ALTAIR_API_USER_TOKEN_STORAGE_KEY);
    }
  }

  private setAuthHeaderBeforeRequest(req: Request) {
    if (this.authToken) {
      req.headers.set('Authorization', `Bearer ${this.authToken}`);
    }
  }

  private nonce() {
    const validChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let array = new Uint8Array(40);
    crypto.getRandomValues(array);
    array = array.map(x => validChars.charCodeAt(x % validChars.length));
    return String.fromCharCode(...array);
  }

  private getPopupUrl(nonce: string) {
    const url = new URL(this.options.loginClientUrl);
    url.searchParams.append('nonce', nonce);
    url.searchParams.append('sc', location.origin);

    return url.href;
  }

  observeUser() {
    // check user and force the value to be emitted
    // Forcing the value to be emitted triggers the observable at least once
    this.checkCachedUser().then(() => this.user$.next(this.user));
    return this.user$.asObservable();
  }

  async getUser() {
    return this.observeUser()
      .pipe(take(1))
      .toPromise();
  }
  async signInWithCustomToken(token: string) {
    this.authToken = token;
    this.setCachedToken(token);

    const user = await this.ky.get('auth/me').json<IUserProfile>();

    this.user = user;
    return user;
  }

  async signinWithPopup() {
    const token = await timeout(this.signinWithPopupGetToken(), SignInTimeout);

    return this.signInWithCustomToken(token);
  }

  private async signinWithPopupGetToken() {
    const nonce = this.nonce();
    const popup = window.open(this.getPopupUrl(nonce), 'Altair GraphQL');
    if (!popup) {
      throw new Error('Could not create signin popup!');
    }
    return new Promise<string>((resolve, reject) => {
      const listener = (message: MessageEvent) => {
        try {
          const type = message?.data?.type;
          if (type === OAUTH_POPUP_CALLBACK_MESSAGE_TYPE) {
            if (
              new URL(message.origin).href !==
              new URL(this.options.loginClientUrl).href
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

  signOut() {
    this.authToken = undefined;
    this.user = undefined;
    this.clearCachedToken();
  }

  createQuery(queryInput: ICreateQueryDto) {
    return this.ky.post('queries', { json: queryInput }).json<QueryItem>();
  }

  updateQuery(id: string, queryInput: IUpdateQueryDto) {
    return this.ky.patch(`queries/${id}`, { json: queryInput }).json();
  }

  deleteQuery(id: string) {
    return this.ky.delete(`queries/${id}`).json();
  }

  getQuery(id: string) {
    return this.ky.get(`queries/${id}`).json<QueryItem | undefined>();
  }

  createQueryCollection(collectionInput: ICreateQueryCollectionDto) {
    return this.ky
      .post('query-collections', { json: collectionInput })
      .json<QueryCollection>();
  }

  updateCollection(id: string, collectionInput: IUpdateQueryCollectionDto) {
    return this.ky
      .patch(`query-collections/${id}`, { json: collectionInput })
      .json();
  }

  deleteCollection(id: string) {
    return this.ky.delete(`query-collections/${id}`).json();
  }

  getCollection(id: string) {
    return this.ky
      .get(`query-collections/${id}`)
      .json<FullQueryCollection | undefined>();
  }
  getCollections() {
    return this.ky.get(`query-collections`).json<FullQueryCollection[]>();
  }

  createTeam(teamInput: ICreateTeamDto) {
    return this.ky.post('teams', { json: teamInput }).json<Team>();
  }

  updateTeam(id: string, teamInput: IUpdateTeamDto) {
    return this.ky.patch(`teams/${id}`, { json: teamInput }).json();
  }

  deleteTeam(id: string) {
    return this.ky.delete(`teams/${id}`).json();
  }

  getTeam(id: string) {
    return this.ky.get(`teams/${id}`).json<Team | undefined>();
  }

  getTeams() {
    return this.ky.get(`teams`).json<Team[]>();
  }

  addTeamMember(input: ICreateTeamMembershipDto) {
    return this.ky
      .post('team-memberships', { json: input })
      .json<TeamMembership>();
  }

  getTeamMembers(teamId: string) {
    return this.ky
      .get(`team-memberships/team/${teamId}`)
      .json<ReturnedTeamMembership[]>();
  }

  getBillingUrl() {
    return this.ky.get('user/billing').json<{ url: string }>();
  }

  async openBillingPage() {
    const res = await this.getBillingUrl();

    window.open(res.url, '_blank');
  }

  getUserStats() {
    return this.ky.get('user/stats').json<IUserStats>();
  }

  // short-lived-token for events
  private getSLT() {
    return this.ky.get(`auth/slt`).json<{ slt: string }>();
  }

  private fromEventSource(url: string) {
    return new Observable(subscriber => {
      const eventSource = new EventSource(url);
      eventSource.onmessage = x => subscriber.next(x.data);
      eventSource.onerror = x => subscriber.error(x);

      return () => {
        eventSource?.close();
      };
    });
  }

  listenForEvents() {
    return from(this.getSLT()).pipe(
      take(1),
      map(res => {
        const url = new URL('/events', this.options.apiBaseUrl);

        url.searchParams.append('slt', res.slt);

        return url.href;
      }),
      switchMap(url => this.fromEventSource(url))
    );
  }
}

export const initializeClient = (env: ClientEnvironment = 'development') => {
  const config = getClientConfig(env);

  const apiClient = new APIClient(config);

  return apiClient;
};
