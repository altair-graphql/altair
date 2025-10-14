import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  inject,
} from '@angular/core';
import { AccountState } from 'altair-graphql-core/build/types/state/account.interfaces';
import { apiClient } from '../../services/api/api.service';
import { externalLink } from '../../utils';
import { IdentityProvider } from '@altairgraphql/db';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-account-dialog',
  templateUrl: './account-dialog.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AccountDialogComponent {
  readonly showDialog = input(true);
  readonly account = input<AccountState>();
  readonly toggleDialogChange = output<boolean>();
  readonly handleLoginChange = output<IdentityProvider>();
  readonly logoutChange = output();

  googleIcon: SafeHtml;
  private sanitizer = inject(DomSanitizer);

  constructor() {
    const googleSvg = `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024" fill="currentColor">
  <path d="M881 442.4H519.7v148.5h206.4c-8.9 48-35.9 88.6-76.6 115.8-34.4 23-78.3 36.6-129.9 36.6-99.9 0-184.4-67.5-214.6-158.2-7.6-23-12-47.6-12-72.9s4.4-49.9 12-72.9c30.3-90.6 114.8-158.1 214.7-158.1 56.3 0 106.8 19.4 146.6 57.4l110-110.1c-66.5-62-153.2-100-256.6-100-149.9 0-279.6 86-342.7 211.4-26 51.8-40.8 110.4-40.8 172.4S151 632.8 177 684.6C240.1 810 369.8 896 519.7 896c103.6 0 190.4-34.4 253.8-93 72.5-66.8 114.4-165.2 114.4-282.1 0-27.2-2.4-53.3-6.9-78.5z"/>
</svg>`;
    this.googleIcon = this.sanitizer.bypassSecurityTrustHtml(googleSvg);
  }

  submitLogin(provider: IdentityProvider = IdentityProvider.GOOGLE) {
    this.handleLoginChange.emit(provider);
  }
  async openBillingPage(e: MouseEvent) {
    const { url } = await apiClient.getBillingUrl();
    return externalLink(url, e);
  }

  async openUpgradeProUrl(e: MouseEvent) {
    const { url } = await apiClient.getUpgradeProUrl();
    return externalLink(url, e);
  }

  async buyCredits(e: MouseEvent) {
    const { url } = await apiClient.buyCredits();
    if (url) {
      return externalLink(url, e);
    }
  }
}
