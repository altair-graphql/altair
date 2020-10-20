import { Injectable } from '@angular/core';
import { WebsocketSubscriptionProvider } from './providers/ws';
import { SubscriptionProvider, SubscriptionProviderConstructor } from './subscription-provider';

@Injectable()
export class SubscriptionFactoryService {
  getSubscriptionProvider(context: string): SubscriptionProviderConstructor {
    return WebsocketSubscriptionProvider;
  }
}
