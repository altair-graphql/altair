import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountState } from 'altair-graphql-core/build/types/state/account.interfaces';
import { environment } from 'environments/environment';
import { apiClient } from '../../services/api/api.service';
import { externalLink } from '../../utils';

@Component({
  selector: 'app-account-dialog',
  templateUrl: './account-dialog.component.html',
  styles: [],
})
export class AccountDialogComponent {
  @Input() showDialog = true;
  @Input() account: AccountState | undefined;
  @Output() toggleDialogChange = new EventEmitter<boolean>();
  @Output() handleLoginChange = new EventEmitter();
  @Output() logoutChange = new EventEmitter();

  dashboardUrl = apiClient.options.dashboardUrl;

  submitLogin() {
    this.handleLoginChange.emit();
  }
  async openBillingPage(e: MouseEvent) {
    const { url } = await apiClient.getBillingUrl();
    return externalLink(e, url);
  }
}
