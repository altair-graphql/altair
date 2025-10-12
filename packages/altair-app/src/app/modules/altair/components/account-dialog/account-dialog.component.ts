import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { AccountState } from 'altair-graphql-core/build/types/state/account.interfaces';
import { apiClient } from '../../services/api/api.service';
import { externalLink } from '../../utils';
import { IdentityProvider } from '@altairgraphql/db';

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
