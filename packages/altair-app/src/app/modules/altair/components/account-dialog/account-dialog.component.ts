import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountState } from 'altair-graphql-core/build/types/state/account.interfaces';

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

  submitLogin() {
    this.handleLoginChange.emit();
  }
}
