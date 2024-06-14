import { Observable } from 'rxjs';
import {
  GraphQLRequestHandler,
  GraphQLRequestOptions,
  GraphQLResponseData,
} from '../types';
import { parse } from 'graphql';
import { AUTH_TYPE, createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core';

export class AppSyncRequestHandler implements GraphQLRequestHandler {
  subscription?: ZenObservable.Subscription;

  /**
  {
    "aws_project_region": "us-west-2",
    "aws_appsync_graphqlEndpoint": "https://....appsync-api.us-west-2.amazonaws.com/graphql",
    "aws_appsync_region": "us-west-2",
    "aws_appsync_authenticationType": "API_KEY",
    "aws_appsync_apiKey": "..."
    "aws_appsync_jwtToken" "..."
  }
   */
  handle(request: GraphQLRequestOptions): Observable<GraphQLResponseData> {
    return new Observable((subscriber) => {
      const url =
        typeof request.additionalParams?.aws_appsync_graphqlEndpoint === 'string'
          ? request.additionalParams.aws_appsync_graphqlEndpoint
          : '';
      const region =
        typeof request.additionalParams?.aws_appsync_region === 'string'
          ? request.additionalParams.aws_appsync_region
          : '';
      const auth = {
        type: (typeof request.additionalParams?.aws_appsync_authenticationType ===
        'string'
          ? request.additionalParams.aws_appsync_authenticationType
          : '') as any,
        apiKey:
          typeof request.additionalParams?.aws_appsync_apiKey === 'string'
            ? request.additionalParams.aws_appsync_apiKey
            : '',
        jwtToken:
          typeof request.additionalParams?.aws_appsync_jwtToken === 'string'
            ? request.additionalParams.aws_appsync_jwtToken
            : '',
      };

      const link = ApolloLink.from([
        createAuthLink({ url, region, auth }),
        createSubscriptionHandshakeLink({ url, region, auth }),
      ]);

      const client = new ApolloClient({
        link,
        cache: new InMemoryCache(),
      });

      const requestStartTimestamp = Date.now();
      this.subscription = client
        .subscribe({
          query: parse(request.query),
          variables: request.variables,
        })
        .subscribe({
          next: (res) => {
            const requestEndTimestamp = Date.now();

            subscriber.next({
              ok: true,
              data: JSON.stringify(res),
              headers: new Headers(),
              status: 200,
              statusText: 'OK',
              url: request.url,
              requestStartTimestamp,
              requestEndTimestamp,
              resopnseTimeMs: requestEndTimestamp - requestStartTimestamp,
            });
          },
          error: (...args) => subscriber.error(...args),
          complete: () => subscriber.complete(),
        });

      return () => {
        this.destroy();
      };
    });
  }
  generateCurl(request: GraphQLRequestOptions): string {
    throw new Error('Method not implemented.');
  }
  destroy(): void {
    if (this.subscription?.closed) {
      this.subscription?.unsubscribe();
    }
  }
}
