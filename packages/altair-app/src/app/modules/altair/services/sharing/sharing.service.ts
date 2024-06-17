import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { WindowService } from '../window.service';
import { NotifyService } from '../notify/notify.service';
import { debug } from '../../utils/logger';
import { AccountService } from '../account/account.service';
import { copyToClipboard } from '../../utils';

interface ShareDetails {
  queryId: string;
}
@Injectable({
  providedIn: 'root',
})
export class SharingService {
  constructor(
    private apiService: ApiService,
    private accountService: AccountService,
    private windowService: WindowService,
    private notifyService: NotifyService
  ) {}

  /**
   * we check for shared urls on app initialization
   */
  checkForShareUrl(url = window.location.href) {
    debug.log('Checking for shared url', url);
    this.accountService.observeUser().subscribe((user) => {
      if (!user) {
        return;
      }
      const shareDetails = this.getShareDetailsFromUrl(url);
      if (!shareDetails) {
        return;
      }
      this.handleShareDetails(shareDetails);
    });
  }

  copyQueryShareUrl(queryId: string) {
    copyToClipboard(this.apiService.getQueryShareUrl(queryId));
    this.notifyService.info(`Copied share url to clipboard`);
  }

  private getShareDetailsFromUrl(url: string) {
    const u = new URL(url);
    const urlParams = new URLSearchParams(u.search);
    const queryId = urlParams.get('q');
    if (!queryId) {
      // no shared link
      return;
    }

    //  Clear query parameter
    window.history.replaceState({}, document.title, window.location.pathname);

    return { queryId };
  }

  private async handleShareDetails(shareDetails: ShareDetails) {
    try {
      const res = await this.apiService.getQuery(shareDetails.queryId);
      if (!res) {
        throw new Error('Query not found');
      }
      await this.windowService.loadQueryFromCollection(
        res.query,
        res.collectionId,
        res.query.id ?? shareDetails.queryId
      );
    } catch (err) {
      debug.error(err);
      this.notifyService.error(`Error loading shared query`);
    }
  }
}
