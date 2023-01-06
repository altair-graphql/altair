import { Component, ViewEncapsulation, Input } from '@angular/core';
import { SubscriptionResponse } from 'altair-graphql-core/build/types/state/query.interfaces';

@Component({
  selector: 'app-subscription-result-item',
  templateUrl: './subscription-result-item.component.html',
  styleUrls: ['./subscription-result-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class SubscriptionResultItemComponent {
  @Input() data: SubscriptionResponse = {
    response: '',
    responseObj: null,
    responseTime: 0,
  };

  isExpanded = false;

  constructor() {}

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }
}
