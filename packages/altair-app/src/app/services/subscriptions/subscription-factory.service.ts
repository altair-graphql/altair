import { Injectable } from '@angular/core';
import { WebsocketSubscriptionProvider } from './providers/ws';
import { SubscriptionProvider, SubscriptionProviderConstructor } from './subscription-provider';
import { AppSyncSubscriptionProvider } from './providers/app-sync';

@Injectable()
export class SubscriptionFactoryService {
  getSubscriptionProvider(context: string): SubscriptionProviderConstructor {
    switch (context) {
      case 'app-sync':
      default:
        return AppSyncSubscriptionProvider;
    }

    // return WebsocketSubscriptionProvider;
  }
}
