import { Observable } from 'rxjs';
import { IDictionary } from '../types/shared';

export interface SubscriptionProviderExtraOptions {
  onConnected?: (error: unknown, data: unknown) => void;
  headers?: IDictionary<string>;
}

export interface SubscriptionProviderExecuteOptions {
  query: string;
  variables?: IDictionary;
  operationName?: string;
}

export type SubscriptionProviderConstructor = new (
  subscriptionUrl: string,
  connectionParams: IDictionary,
  extraOptions?: SubscriptionProviderExtraOptions
) => SubscriptionProvider;

export abstract class SubscriptionProvider {
  constructor(
    protected subscriptionUrl: string,
    protected connectionParams: IDictionary,
    protected extraOptions?: SubscriptionProviderExtraOptions
  ) {}

  abstract execute(
    options: SubscriptionProviderExecuteOptions
  ): Observable<unknown>;

  abstract close(): void;
}
