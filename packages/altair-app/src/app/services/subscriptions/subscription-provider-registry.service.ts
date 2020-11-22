import { Injectable } from '@angular/core';
import { SubscriptionProviderConstructor } from './subscription-provider';

interface SubscriptionProviderData {
  id: string;
  getProviderClass: () => Promise<SubscriptionProviderConstructor>;
  copyTag?: string;
}

export const WEBSOCKET_PROVIDER_ID = 'websocket';
export const APP_SYNC_PROVIDER_ID = 'app-sync';
export const ACTION_CABLE_PROVIDER_ID = 'action-cable';
@Injectable()
export class SubscriptionProviderRegistryService {
  private list: SubscriptionProviderData[] = [];

  constructor() {
    this.addProviderData({
      id: WEBSOCKET_PROVIDER_ID,
      getProviderClass: async() => (await import('./providers/ws')).WebsocketSubscriptionProvider,
      copyTag: 'SUBSCRIPTION_PROVIDER_WEBSOCKET',
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
}
