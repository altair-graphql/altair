import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api/api.service';
import { WindowService } from '../window.service';
import { NotifyService } from '../notify/notify.service';
import { debug } from '../../utils/logger';
import { AccountService } from '../account/account.service';
import { copyToClipboard } from '../../utils';
import { consumeQueryParam } from '../../utils/url';

// ?q=<queryId>
interface SharedRemoteQuery {
  type: 'remote-query';
  queryId: string;
}

// ?query=<query>&variables=<variables>&endpoint=<endpoint>
interface SharedWindowData {
  type: 'window-data';
  endpoint: string | undefined;
  query: string;
  variables: string | undefined;
}

type SharedUrlInfo = SharedRemoteQuery | SharedWindowData;

@Injectable({
  providedIn: 'root',
})
export class SharingService {
  private apiService = inject(ApiService);
  private accountService = inject(AccountService);
  private windowService = inject(WindowService);
  private notifyService = inject(NotifyService);


  /**
   * we check for shared urls on app initialization
   */
  checkForShareUrl(url = window.location.href) {
    debug.log('Checking for shared url', url);
    const shareDetails = this.getShareDetailsFromUrl(url);
    if (!shareDetails) {
      return;
    }

    this.handleShareDetails(shareDetails);
  }

  copyQueryShareUrl(queryId: string) {
    copyToClipboard(this.apiService.getQueryShareUrl(queryId));
    this.notifyService.info(`Copied share url to clipboard`);
  }

  private getShareDetailsFromUrl(url: string): SharedUrlInfo | undefined {
    const queryId = consumeQueryParam('q', url);
    if (queryId) {
      // shared remote query
      return { type: 'remote-query', queryId };
    }
    const query = consumeQueryParam('query', url);
    if (query) {
      // shared window data
      return {
        type: 'window-data',
        query,
        variables: consumeQueryParam('variables', url),
        endpoint: consumeQueryParam('endpoint', url),
      };
    }

    return;
  }

  private async handleShareDetails(shareDetails: SharedUrlInfo) {
    try {
      switch (shareDetails.type) {
        case 'window-data': {
          const { query, variables, endpoint } = shareDetails;
          return this.windowService.importWindowData({
            ...this.windowService.getEmptyWindowState(),
            query,
            variables: variables ?? '{}',
            apiUrl: endpoint ?? '',
            windowName: 'From url',
          });
        }
        case 'remote-query': {
          const user = await this.accountService.getUser();
          if (!user) {
            return;
          }
          const res = await this.apiService.getQuery(shareDetails.queryId);
          if (!res) {
            throw new Error('Query not found');
          }
          return this.windowService.loadQueryFromCollection(
            res.query,
            res.collectionId,
            res.query.id ?? shareDetails.queryId
          );
        }
      }
    } catch (err) {
      debug.error(err);
      this.notifyService.error(`Error loading shared details`);
    }
  }
}
