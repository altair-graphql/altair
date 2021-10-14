import { Injectable } from '@angular/core';
import { ACTION_CABLE_PROVIDER_ID, APP_SYNC_PROVIDER_ID, GRAPHQL_WS_PROVIDER_ID, SubscriptionProviderData, WEBSOCKET_PROVIDER_ID } from 'altair-graphql-core/build/subscriptions';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SubscriptionProviderRegistryService {
  private list: SubscriptionProviderData[] = [];
  private list$ = new BehaviorSubject(this.list);

  constructor() {
    this.addProviderData({
      id: WEBSOCKET_PROVIDER_ID,
      getProviderClass: async() =>
        (await import('altair-graphql-core/build/subscriptions/providers/ws')).WebsocketSubscriptionProvider,
      copyTag: 'SUBSCRIPTION_PROVIDER_WEBSOCKET',
    });

    this.addProviderData({
      id: GRAPHQL_WS_PROVIDER_ID,
      getProviderClass: async() =>
        (await import('altair-graphql-core/build/subscriptions/providers/graphql-ws')).GraphQLWsSubscriptionProvider,
      copyTag: 'SUBSCRIPTION_PROVIDER_GRAPHQL_WS',
    });

    this.addProviderData({
      id: APP_SYNC_PROVIDER_ID,
      getProviderClass: async() =>
        (await import('altair-graphql-core/build/subscriptions/providers/app-sync')).AppSyncSubscriptionProvider,
      copyTag: 'SUBSCRIPTION_PROVIDER_APP_SYNC',
    });

    this.addProviderData({
      id: ACTION_CABLE_PROVIDER_ID,
      getProviderClass: async() =>
        (await import('altair-graphql-core/build/subscriptions/providers/action-cable')).ActionCableSubscriptionProvider,
      copyTag: 'SUBSCRIPTION_PROVIDER_ACTION_CABLE',
    });
  }

  addProviderData(providerData: SubscriptionProviderData) {
    this.list.push(providerData);
    this.list$.next(this.list);
  }

  getProviderData(providerId: string) {
    const providerData = this.list.find(_ => _.id === providerId);
    if (!providerData) {
      throw new Error(`No subscription provider found for "${providerId}"`);
    }

    return providerData;
  }

  getAllProviderData() {
    return this.list;
  }

  getAllProviderData$() {
    // return a new observable each time to separate the subscriptions
    return this.list$.asObservable();
  }
}
