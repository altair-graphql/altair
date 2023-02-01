import { APIClientOptions, ClientEnvironment, getClientConfig } from './config';
import { OAUTH_POPUP_CALLBACK_MESSAGE_TYPE } from './constants';
import ky from 'ky';
import { KyInstance } from 'ky/distribution/types/ky';
import {
  CreateQueryCollectionDto,
  CreateQueryDto,
  UpdateQueryCollectionDto,
  UpdateQueryDto,
} from './query';
import {
  QueryItem,
  QueryCollection,
  Team,
  TeamMembership,
} from '@altairgraphql/db';
import { UserProfile } from './user';
import { CreateTeamDto, CreateTeamMembershipDto, UpdateTeamDto } from './team';
import { from, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
export type FullQueryCollection = QueryCollection & {
  queries: QueryItem[];
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
  user?: UserProfile;

  constructor(public options: APIClientOptions) {
    // TODO: Check for user access token in local storage
    // const userInfoText = localStorage.getItem('ALTAIR-API-USER-INFO');
    // this.user = userInfoText ? JSON.parse(userInfoText) : undefined;
    this.ky = ky.extend({
      prefixUrl: options.apiBaseUrl,
      hooks: {
        beforeRequest: [req => this.setAuthHeaderBeforeRequest(req)],
      },
    });
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

  async getUser() {
    return this.user;
  }
  async signInWithCustomToken(token: string) {
    this.authToken = token;

    const user = await this.ky.get('auth/me').json<UserProfile>();

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
  }

  createQuery(queryInput: CreateQueryDto) {
    return this.ky.post('queries', { json: queryInput }).json<QueryItem>();
  }

  updateQuery(id: string, queryInput: UpdateQueryDto) {
    return this.ky.patch(`queries/${id}`, { json: queryInput }).json();
  }

  deleteQuery(id: string) {
    return this.ky.delete(`queries/${id}`).json();
  }

  getQuery(id: string) {
    return this.ky.get(`queries/${id}`).json<QueryItem | undefined>();
  }

  createQueryCollection(collectionInput: CreateQueryCollectionDto) {
    return this.ky
      .post('query-collections', { json: collectionInput })
      .json<QueryCollection>();
  }

  updateCollection(id: string, collectionInput: UpdateQueryCollectionDto) {
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

  createTeam(teamInput: CreateTeamDto) {
    return this.ky.post('teams', { json: teamInput }).json<Team>();
  }

  updateTeam(id: string, teamInput: UpdateTeamDto) {
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

  addTeamMember(input: CreateTeamMembershipDto) {
    return this.ky
      .post('team-memberships', { json: input })
      .json<TeamMembership>();
  }

  getTeamMembers(teamId: string) {
    return this.ky
      .get(`team-memberships/team/${teamId}`)
      .json<TeamMembership[]>();
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
