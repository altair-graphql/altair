import { SubscriptionProviderConstructor } from './subscription-provider';

export interface SubscriptionProviderData {
  /**
   * Unique identifier for the provider
   */
  id: string;

  /**
   * Function that returns a promise that resolves with the provider class (NOT an instance of the class)
   */
  getProviderClass: () => Promise<SubscriptionProviderConstructor>;

  /**
   * The text to be shown for this provider in the Altair UI
   */
  copyTag?: string;
}
