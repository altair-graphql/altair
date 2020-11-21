import { Injectable } from '@angular/core';
import { SubscriptionProviderConstructor } from './subscription-provider';
import { WebsocketSubscriptionProvider, WEBSOCKET_PROVIDER_ID } from './providers/ws';
import { AppSyncSubscriptionProvider, APP_SYNC_PROVIDER_ID } from './providers/app-sync';
import { ActionCableSubscriptionProvider, ACTION_CABLE_PROVIDER_ID } from './providers/action-cable';

interface SubscriptionProviderData {
  id: string;
  providerClass: SubscriptionProviderConstructor;
  copyTag?: string;
}

@Injectable()
export class SubscriptionProviderRegistryService {
  private list: SubscriptionProviderData[] = [];

  constructor() {
    this.addProviderData({
      id: WEBSOCKET_PROVIDER_ID,
      providerClass: WebsocketSubscriptionProvider,
      copyTag: 'SUBSCRIPTION_PROVIDER_WEBSOCKET',
    });

    this.addProviderData({
      id: APP_SYNC_PROVIDER_ID,
      providerClass: AppSyncSubscriptionProvider,
      copyTag: 'SUBSCRIPTION_PROVIDER_APP_SYNC',
    });

    this.addProviderData({
      id: ACTION_CABLE_PROVIDER_ID,
      providerClass: ActionCableSubscriptionProvider,
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
