import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Extension } from '@codemirror/state';
import { json } from '@codemirror/lang-json';

@Component({
  selector: 'app-subscription-url-dialog',
  templateUrl: './subscription-url-dialog.component.html',
})
export class SubscriptionUrlDialogComponent {
  @Input() subscriptionUrl = '';
  @Input() subscriptionConnectionParams = '';
  @Input() selectedSubscriptionProviderId = '';
  @Input() subscriptionProviders = [];
  @Input() showDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() subscriptionUrlChange = new EventEmitter();
  @Output() subscriptionConnectionParamsChange = new EventEmitter();
  @Output() subscriptionProviderIdChange = new EventEmitter();

  connectionParamsExtensions: Extension[] = [json()];

  constructor() {}

  subscriptionUrlInput(event: Event) {
    if (event.target) {
      this.subscriptionUrlChange.emit((event.target as any).value);
    }
  }

  updateSubscriptionProviderId(providerId: string) {
    this.subscriptionProviderIdChange.emit(providerId);
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
