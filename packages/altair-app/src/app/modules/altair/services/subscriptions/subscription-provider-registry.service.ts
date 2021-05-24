import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SubscriptionProviderConstructor } from './subscription-provider';

export interface SubscriptionProviderData {
  id: string;
  getProviderClass: () => Promise<SubscriptionProviderConstructor>;
  copyTag?: string;
}

export const WEBSOCKET_PROVIDER_ID = 'websocket';
export const GRAPHQL_WS_PROVIDER_ID = 'graphql-ws';
export const APP_SYNC_PROVIDER_ID = 'app-sync';
export const ACTION_CABLE_PROVIDER_ID = 'action-cable';

export const SUBSCRIPTION_PROVIDER_IDS = {
  WEBSOCKET: WEBSOCKET_PROVIDER_ID,
  GRAPHQL_WS: GRAPHQL_WS_PROVIDER_ID,
  APP_SYNC: APP_SYNC_PROVIDER_ID,
  ACTION_CABLE: ACTION_CABLE_PROVIDER_ID
} as const;

export type SubscriptionProviderIds = typeof SUBSCRIPTION_PROVIDER_IDS[keyof typeof SUBSCRIPTION_PROVIDER_IDS];

@Injectable()
export class SubscriptionProviderRegistryService {
  private list: SubscriptionProviderData[] = [];
  private list$ = new BehaviorSubject(this.list);

  constructor() {
    this.addProviderData({
      id: WEBSOCKET_PROVIDER_ID,
      getProviderClass: async() => (await import('./providers/ws')).WebsocketSubscriptionProvider,
      copyTag: 'SUBSCRIPTION_PROVIDER_WEBSOCKET',
    });

    this.addProviderData({
      id: GRAPHQL_WS_PROVIDER_ID,
      getProviderClass: async() => (await import('./providers/graphql-ws')).GraphQLWsSubscriptionProvider,
      copyTag: 'SUBSCRIPTION_PROVIDER_GRAPHQL_WS',
    });

    this.addProviderData({
      id: APP_SYNC_PROVIDER_ID,
      getProviderClass: async() => (await import('./providers/app-sync')).AppSyncSubscriptionProvider,
      copyTag: 'SUBSCRIPTION_PROVIDER_APP_SYNC',
    });

    this.addProviderData({
      id: ACTION_CABLE_PROVIDER_ID,
      getProviderClass: async() => (await import('./providers/action-cable')).ActionCableSubscriptionProvider,
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
    return this.list$;
  }
}
