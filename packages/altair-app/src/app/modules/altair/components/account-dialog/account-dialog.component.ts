import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  input
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountState } from 'altair-graphql-core/build/types/state/account.interfaces';
import { environment } from 'environments/environment';
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
  @Input() account: AccountState | undefined;
  @Output() toggleDialogChange = new EventEmitter<boolean>();
  @Output() handleLoginChange = new EventEmitter<IdentityProvider>();
  @Output() logoutChange = new EventEmitter();

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
