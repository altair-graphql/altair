import { SubscriptionProvider, SubscriptionProviderExecuteOptions } from '../subscription-provider';
import { Observable, of } from 'rxjs';
import { createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { ApolloClient, ApolloLink, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { parse } from 'graphql';

export const APP_SYNC_PROVIDER_ID = 'app-sync';

export class AppSyncSubscriptionProvider extends SubscriptionProvider {
  subscription?: any;

  /**
  {
    "aws_project_region": "us-west-2",
    "aws_appsync_graphqlEndpoint": "https://id4nunjlyjcy7pejnt6wevqq3i.appsync-api.us-west-2.amazonaws.com/graphql",
    "aws_appsync_region": "us-west-2",
    "aws_appsync_authenticationType": "API_KEY",
    "aws_appsync_apiKey": "da2-jtzcgtgkmjd2hejvokpql7o6tm"
  }
   */

  execute(options: SubscriptionProviderExecuteOptions) {
    const url = this.connectionParams.aws_appsync_graphqlEndpoint;
    const region = this.connectionParams.aws_appsync_region;
    const auth = {
      type: this.connectionParams.aws_appsync_authenticationType,
      apiKey: this.connectionParams.aws_appsync_apiKey,
    };

    // TODO: Validate input
    const httpLink = createHttpLink({ uri: url });

    const link = ApolloLink.from([
      createAuthLink({ url, region, auth }),
      createSubscriptionHandshakeLink(url, httpLink),
    ]);

    const client = new ApolloClient({
      link,
      cache: new InMemoryCache()
    });

    const subscription = client.subscribe({
      query: parse(options.query),
      variables: options.variables
    })
    return new Observable((subscriber) => {
      // TODO: Figure out proper typing of API.graphql
      this.subscription = subscription.subscribe({
        next: (...args: any[]) =>  subscriber.next(...args),
        error: (...args: any[]) => subscriber.error(...args),
        complete: () => subscriber.complete(),
      });
    });
  }

  close() {
    this.subscription?.unsubscribe();
  }
}
