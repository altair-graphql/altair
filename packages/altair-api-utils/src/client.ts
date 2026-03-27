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
  ExportedCollection,
} from './query';
import {
  QueryItem,
  QueryCollection,
  Team,
  TeamMembership,
  TeamInvitation,
  QueryItemRevision,
  AiChatSession,
  AiChatMessage,
  IdentityProvider,
  SharedQuery,
} from '@altairgraphql/db';
import { AltairConfig, getAltairConfig } from 'altair-graphql-core/build/config';
import { IPlan, IPlanInfo, IUserProfile, IUserStats, IToken } from './user';
import {
  ICreateTeamDto,
  ICreateTeamInvitationDto,
  ICreateTeamMembershipDto,
  IUpdateTeamDto,
} from './team';
import { firstValueFrom, from, Observable, ReplaySubject } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import {
  ReturnedWorkspace,
  ICreateWorkspaceDto,
  IUpdateWorkspaceDto,
} from './workspace';
import { ConfigEnvironment } from 'altair-graphql-core/build/config/environment';
import { UrlConfig } from 'altair-graphql-core/build/config/urls';
import { AiStreamEvent, IRateMessageDto, ISendMessageDto } from './ai';
import { ICreditTransactionsResponse } from './credit';
import { IAvailableCredits } from 'altair-graphql-core/build/types/state/account.interfaces';
import { getPopupUrl } from 'altair-graphql-core/build/identity/providers';
export type FullQueryCollection = QueryCollection & {
  queries: QueryItem[];
};
export type SharedQueryWithContent = SharedQuery & {
  query: QueryItem;
};
export type ReturnedTeamMembership = TeamMembership & {
  user: Pick<IUserProfile, 'firstName' | 'lastName' | 'email'>;
};
export type QueryItemRevisionWithUsername = QueryItemRevision & {
  createdByUser: Pick<IUserProfile, 'firstName' | 'lastName' | 'email'>;
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

  user$ = new ReplaySubject<IUserProfile | undefined>(1);
  private _user?: IUserProfile;
  get user() {
    return this._user;
  }
  set user(val) {
    this._user = val;
    this.user$.next(val);
  }

  constructor(public urlConfig: UrlConfig) {
    this.ky = ky.extend({
      prefixUrl: urlConfig.api,
      hooks: {
        beforeRequest: [(req) => this.setAuthHeaderBeforeRequest(req)],
      },
      timeout: false,
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
    array = array.map((x) => validChars.charCodeAt(x % validChars.length));
    return String.fromCharCode(...array);
  }

  private getPopupUrl(
    nonce: string,
    provider: IdentityProvider = IdentityProvider.GOOGLE
  ) {
    return getPopupUrl(this.urlConfig.loginClient, nonce, location.origin, provider);
  }

  observeUser() {
    // check user and force the value to be emitted
    // Forcing the value to be emitted triggers the observable at least once
    this.checkCachedUser().then(() => this.user$.next(this.user));
    return this.user$.asObservable();
  }

  async getUser() {
    return firstValueFrom(this.observeUser().pipe(take(1)));
  }
  async signInWithCustomToken(token: string) {
    this.authToken = token;
    this.setCachedToken(token);

    const user = await this.ky.get('auth/me').json<IUserProfile>();

    this.user = user;
    return user;
  }

  async signinWithPopup(provider: IdentityProvider = IdentityProvider.GOOGLE) {
    const token = await timeout(
      this.signinWithPopupGetToken(provider),
      SignInTimeout
    );

    return this.signInWithCustomToken(token);
  }

  private async signinWithPopupGetToken(
    provider: IdentityProvider = IdentityProvider.GOOGLE
  ) {
    const nonce = this.nonce();
    const popup = window.open(this.getPopupUrl(nonce, provider), '_blank');
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
              new URL(this.urlConfig.loginClient).href
            ) {
              // Ignore messages from unexpected origins without removing listener
              return;
            }

            // Verify returned nonce
            if (nonce !== message?.data?.payload?.nonce) {
              window.removeEventListener('message', listener);
              popup.close();
              return reject(new Error('nonce does not match!'));
            }

            const token = message?.data?.payload?.token;
            window.removeEventListener('message', listener);
            popup.close();
            return resolve(token);
          }
        } catch (err) {
          window.removeEventListener('message', listener);
          popup.close();
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

  async refreshToken(token: string) {
    const tokens = await this.ky
      .post('auth/refresh', { json: { token } })
      .json<IToken>();
    this.authToken = tokens.accessToken;
    this.setCachedToken(tokens.accessToken);
    return tokens;
  }

  sendVerificationEmail(callbackUrl?: string) {
    return this.ky
      .post('auth/send-verification', {
        json: { ...(callbackUrl ? { callbackUrl } : {}) },
      })
      .json<{ sent: boolean }>();
  }

  verifyEmail(token: string) {
    return this.ky
      .post('auth/verify-email', { json: { token } })
      .json<{ verified: boolean }>();
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

  getQueryRevisions(id: string) {
    return this.ky
      .get(`queries/${id}/revisions`)
      .json<QueryItemRevisionWithUsername[]>();
  }

  restoreQueryRevision(id: string, revisionId: string) {
    return this.ky
      .post(`queries/${id}/revisions/${revisionId}/restore`)
      .json<QueryItem>();
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

  moveCollection(
    id: string,
    dto: { parentCollectionId?: string | null; workspaceId?: string }
  ) {
    return this.ky
      .patch(`query-collections/${id}/move`, { json: dto })
      .json<FullQueryCollection>();
  }

  getCollection(id: string) {
    return this.ky

      .get(`query-collections/${id}`)
      .json<FullQueryCollection | undefined>();
  }

  getCollections() {
    return this.ky.get(`query-collections`).json<FullQueryCollection[]>();
  }

  exportCollection(id: string) {
    return this.ky.get(`query-collections/${id}/export`).json<ExportedCollection>();
  }

  importCollection(
    workspaceId: string,
    data: ExportedCollection,
    parentCollectionId?: string
  ) {
    return this.ky
      .post('query-collections/import', {
        json: {
          workspaceId,
          data,
          ...(parentCollectionId ? { parentCollectionId } : {}),
        },
      })
      .json<{ id: string; name: string }>();
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
    return this.ky.post('team-memberships', { json: input }).json<TeamMembership>();
  }

  getTeamMembers(teamId: string) {
    return this.ky
      .get(`team-memberships/team/${teamId}`)
      .json<ReturnedTeamMembership[]>();
  }

  createTeamInvitation(teamId: string, input: ICreateTeamInvitationDto) {
    return this.ky
      .post(`team-memberships/team/${teamId}/invitations`, { json: input })
      .json<TeamInvitation>();
  }

  getTeamInvitations(teamId: string) {
    return this.ky
      .get(`team-memberships/team/${teamId}/invitations`)
      .json<TeamInvitation[]>();
  }

  acceptTeamInvitation(token: string) {
    return this.ky
      .post(`team-memberships/invitations/${token}/accept`)
      .json<TeamMembership>();
  }

  revokeTeamInvitation(invitationId: string) {
    return this.ky.delete(`team-memberships/invitations/${invitationId}`).json();
  }

  getWorkspaces() {
    return this.ky.get(`workspaces`).json<ReturnedWorkspace[]>();
  }

  getWorkspace(id: string) {
    return this.ky.get(`workspaces/${id}`).json<ReturnedWorkspace>();
  }

  createWorkspace(dto: ICreateWorkspaceDto) {
    return this.ky.post(`workspaces`, { json: dto }).json<ReturnedWorkspace>();
  }

  updateWorkspace(id: string, dto: IUpdateWorkspaceDto) {
    return this.ky
      .patch(`workspaces/${id}`, { json: dto })
      .json<{ count: number }>();
  }

  deleteWorkspace(id: string) {
    return this.ky.delete(`workspaces/${id}`).json<{ count: number }>();
  }

  getBillingUrl() {
    return this.ky.get('user/billing').json<{ url: string }>();
  }

  getUpgradeProUrl() {
    return this.ky.get('user/upgrade-pro').json<{ url: string }>();
  }

  async openBillingPage() {
    const res = await this.getBillingUrl();

    window.open(res.url, '_blank');
  }

  getUserStats() {
    return this.ky.get('user/stats').json<IUserStats>();
  }

  getUserPlan() {
    return this.ky.get('user/plan').json<IPlan>();
  }

  getPlanInfos() {
    return this.ky.get('plans').json<IPlanInfo[]>();
  }

  getAvailableCredits() {
    return this.ky.get('credits').json<IAvailableCredits>();
  }

  getCreditTransactions(options?: {
    limit?: number;
    cursor?: string;
    type?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (options?.limit) searchParams.set('limit', String(options.limit));
    if (options?.cursor) searchParams.set('cursor', options.cursor);
    if (options?.type) searchParams.set('type', options.type);
    return this.ky
      .get('credits/transactions', { searchParams })
      .json<ICreditTransactionsResponse>();
  }

  buyCredits() {
    return this.ky.post('credits/buy').json<{
      url: string | null;
    }>();
  }

  getActiveAiSession() {
    return this.ky.get('ai/sessions/active').json<AiChatSession>();
  }

  createAiSession() {
    return this.ky.post('ai/sessions').json<AiChatSession>();
  }

  getAiSessions() {
    return this.ky.get('ai/sessions').json<AiChatSession[]>();
  }

  renameAiSession(sessionId: string, title: string) {
    return this.ky
      .patch(`ai/sessions/${sessionId}`, { json: { title } })
      .json<AiChatSession>();
  }

  deleteAiSession(sessionId: string) {
    return this.ky.delete(`ai/sessions/${sessionId}`).json<{ deleted: boolean }>();
  }

  resumeAiSession(sessionId: string) {
    return this.ky.post(`ai/sessions/${sessionId}/resume`).json<AiChatSession>();
  }

  getAiSessionMessages(sessionId: string) {
    return this.ky.get(`ai/sessions/${sessionId}/messages`).json<AiChatMessage[]>();
  }

  sendMessageToAiSession(sessionId: string, input: ISendMessageDto) {
    return this.ky
      .post(`ai/sessions/${sessionId}/messages`, { json: input })
      .json<{ response: string }>();
  }

  /**
   * Stream a message to an AI session. Returns an Observable that emits
   * { type: 'chunk' | 'done' | 'error', content: string } events.
   */
  sendMessageToAiSessionStream(
    sessionId: string,
    input: ISendMessageDto
  ): Observable<AiStreamEvent> {
    return new Observable((subscriber) => {
      const abortController = new AbortController();

      this.ky
        .post(`ai/sessions/${sessionId}/messages/stream`, {
          json: input,
          signal: abortController.signal,
        })
        .then(async (response) => {
          const reader = response.body?.getReader();
          if (!reader) {
            subscriber.error(new Error('No response body'));
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              // Keep the last potentially incomplete line in the buffer
              buffer = lines.pop() ?? '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const event = JSON.parse(line.slice(6)) as AiStreamEvent;
                    subscriber.next(event);
                  } catch {
                    // skip malformed SSE lines
                  }
                }
              }
            }
          } catch (err) {
            if (!abortController.signal.aborted) {
              subscriber.error(err);
              return;
            }
          }

          subscriber.complete();
        })
        .catch((err) => {
          if (!abortController.signal.aborted) {
            subscriber.error(err);
          }
        });

      return () => {
        abortController.abort();
      };
    });
  }

  rateAiMessage(sessionId: string, messageId: string, input: IRateMessageDto) {
    return this.ky
      .post(`ai/sessions/${sessionId}/messages/${messageId}/rate`, {
        json: input,
      })
      .json<AiChatMessage>();
  }

  /**
   * Get a shareable URL for a team query. This URL can be used to share the query with
   * other team members who have access to the same query. The URL will not work for users
   * who do not have access to the query, and will require authentication.
   * Currently, this only works with the desktop app.
   */
  getQueryShareUrl(queryId: string) {
    const url = new URL(this.urlConfig.loginClient);
    url.searchParams.set('action', 'share');
    url.searchParams.set('q', queryId);

    return url.toString();
  }

  sharePublicQuery(queryId: string) {
    return this.ky.post(`queries/${queryId}/share`).json<SharedQuery>();
  }

  unsharePublicQuery(queryId: string) {
    return this.ky.delete(`queries/${queryId}/share`).json();
  }

  /**
   * Get a publicly shared query by its share ID. This is intended for use
   * in the public query sharing flow, where a user can share a query and get a URL
   * that can be accessed by anyone (even without authentication) to view the shared query.
   */
  getSharedPublicQuery(shareId: string) {
    return this.ky.get(`shared/${shareId}`).json<SharedQueryWithContent>();
  }

  // short-lived-token for events
  private getSLT() {
    return this.ky.get(`auth/slt`).json<{ slt: string }>();
  }

  private fromEventSource(url: string): Observable<string> {
    return new Observable((subscriber) => {
      const eventSource = new EventSource(url);
      eventSource.onmessage = (x) => subscriber.next(x.data);
      eventSource.onerror = () => {
        // Only terminate observable if the connection is permanently closed.
        // EventSource auto-reconnects on transient errors (readyState === CONNECTING).
        if (eventSource.readyState === EventSource.CLOSED) {
          subscriber.error(new Error('EventSource connection closed'));
        }
      };

      return () => {
        eventSource.close();
      };
    });
  }

  listenForEvents() {
    return from(this.getSLT()).pipe(
      take(1),
      map((res) => {
        const url = new URL('/events', this.urlConfig.api);

        url.searchParams.append('slt', res.slt);

        return url.href;
      }),
      switchMap((url) => this.fromEventSource(url))
    );
  }
}

export const initializeClient = (env: ConfigEnvironment = 'development') => {
  const apiClient = new APIClient(getAltairConfig().getUrlConfig(env));

  return apiClient;
};
