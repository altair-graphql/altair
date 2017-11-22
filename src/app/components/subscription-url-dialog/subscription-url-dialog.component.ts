import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-subscription-url-dialog',
  templateUrl: './subscription-url-dialog.component.html'
})
export class SubscriptionUrlDialogComponent {

  @Input() subscriptionUrl = '';
  @Input() showDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() subscriptionUrlChange = new EventEmitter();

  constructor() { }

  subscriptionUrlInput(event) {
    this.subscriptionUrlChange.next(event.target.value);
  }

}
