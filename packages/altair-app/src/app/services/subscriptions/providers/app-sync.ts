import { SubscriptionProvider, SubscriptionProviderExecuteOptions } from '../subscription-provider';
import { API, graphqlOperation } from 'aws-amplify';
import ZenObservable from 'zen-observable';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    API.configure(this.connectionParams);

    const subscription = API.graphql(graphqlOperation(options.query, options.variables)) as any;
    console.log('subscription', subscription);

    // TODO: There is an unhandled promise rejection somewhere caused by executing this. This needs to be figured out before merging
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
