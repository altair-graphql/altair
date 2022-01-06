import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-account-dialog',
  templateUrl: './account-dialog.component.html',
  styles: [
  ]
})
export class AccountDialogComponent {
  @Input() showDialog = true;
  @Output() toggleDialogChange = new EventEmitter<boolean>();
  @Output() handleLoginChange = new EventEmitter();

  submitLogin() {
    this.handleLoginChange.emit();
  }

}
