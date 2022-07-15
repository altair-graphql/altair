import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../../store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { debug } from '../../utils/logger';
import { DbService } from '../db.service';
import { DonationService } from '../donation.service';
import { ElectronAppService } from '../electron-app/electron-app.service';
import { EnvironmentService } from '../environment/environment.service';
import { GqlService, SendRequestResponse } from '../gql/gql.service';
import { NotifyService } from '../notify/notify.service';
import {
  PreRequestService,
  RequestType,
  ScriptContextData,
} from '../pre-request/pre-request.service';
import { SubscriptionProviderRegistryService } from '../subscriptions/subscription-provider-registry.service';
import { first, take } from 'rxjs/operators';
import { QueryCollectionService } from '../query-collection/query-collection.service';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { IDictionary } from 'altair-graphql-core/build/types/shared';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  // TODO: Have a single method to hydrate all hydratables from the transformed data
  constructor(
    private notifyService: NotifyService,
    private environmentService: EnvironmentService,
    private preRequestService: PreRequestService,
    private collectionService: QueryCollectionService,
    private store: Store<RootState>
  ) {}

  async getWindowState(windowId: string) {
    return this.store
      .pipe(select(fromRoot.selectWindowState(windowId)))
      .pipe(take(1))
      .toPromise();
  }

  /**
   * Gets pre-request transformed data when given script is executed
   * @param windowId
   * @param script
   * @param preTransformedData
   */
  async getPrerequestScriptTransformedDataForScript(
    windowId: string,
    script: string,
    preTransformedData?: ScriptContextData
  ) {
    const state = await this.getWindowState(windowId);
    if (!state) {
      return preTransformedData;
    }

    const query = (preTransformedData?.query || state.query.query || '').trim();
    const headers = preTransformedData?.headers || state.headers;
    const variables =
      preTransformedData?.variables || state.variables.variables;
    const environment = this.environmentService.mergeWithActiveEnvironment(
      preTransformedData?.environment || {}
    );

    /**
     * pre request execution context is passed the current headers, environment, variables, query, etc
     * and returns a set of the same that would have potentially been modified during the script execution.
     * The returned data is used instead of the original set of data
     */
    try {
      const transformedData = await this.preRequestService.executeScript(
        script,
        {
          environment,
          headers,
          query,
          variables,
        }
      );

      // merge preTransformedData with the new transformedData
      return {
        ...preTransformedData,
        ...transformedData,
      };
    } catch (err) {
      debug.error(err);
      this.notifyService.error(err.message, 'Pre-request error');

      return preTransformedData;
    }
  }

  async getPrerequestTransformedData(
    windowId: string,
    preTransformedData?: ScriptContextData
  ) {
    const state = await this.getWindowState(windowId);
    if (!state || !state.preRequest.enabled) {
      return preTransformedData;
    }

    const collections = await this.getWindowParentCollections(state);
    const collectionsWithEnabledPrerequests = collections.filter(
      (collection) => collection.preRequest?.enabled
    );

    for (const collection of collectionsWithEnabledPrerequests) {
      preTransformedData =
        await this.getPrerequestScriptTransformedDataForScript(
          windowId,
          collection.preRequest?.script || '',
          preTransformedData
        );
    }

    return this.getPrerequestScriptTransformedDataForScript(
      windowId,
      state.preRequest.script,
      preTransformedData
    );
  }

  async getPostRequestTransformedDataForScript(
    windowId: string,
    script: string,
    requestType: RequestType,
    data: SendRequestResponse,
    preTransformedData?: ScriptContextData
  ) {
    const state = await this.getWindowState(windowId);
    if (!state) {
      return preTransformedData;
    }

    const query = (preTransformedData?.query || state.query.query || '').trim();
    const headers = preTransformedData?.headers || state.headers;
    const variables =
      preTransformedData?.variables || state.variables.variables;
    const environment = this.environmentService.mergeWithActiveEnvironment(
      preTransformedData?.environment || {}
    );

    try {
      const transformedData = await this.preRequestService.executeScript(
        script,
        {
          environment,
          headers,
          query,
          variables,
          requestType,
          response: data,
        }
      );

      // merge preTransformedData with the new transformedData
      return {
        ...preTransformedData,
        ...transformedData,
      };
    } catch (err) {
      debug.error(err);
      this.notifyService.error(err.message, 'Post-request error');

      return preTransformedData;
    }
  }

  async getPostRequestTransformedData(
    windowId: string,
    requestType: RequestType,
    data: SendRequestResponse,
    preTransformedData?: ScriptContextData
  ) {
    const state = await this.getWindowState(windowId);
    if (!state || !state.postRequest.enabled) {
      return preTransformedData;
    }

    const collections = await this.getWindowParentCollections(state);
    const collectionsWithEnabledPostrequests = collections.filter(
      (collection) => collection.postRequest?.enabled
    );

    for (const collection of collectionsWithEnabledPostrequests) {
      preTransformedData = await this.getPostRequestTransformedDataForScript(
        windowId,
        collection.postRequest?.script || '',
        requestType,
        data,
        preTransformedData
      );
    }

    return this.getPostRequestTransformedDataForScript(
      windowId,
      state.postRequest.script,
      requestType,
      data,
      preTransformedData
    );
  }

  hydrateAllHydratables(
    window: PerWindowState,
    transformedData?: ScriptContextData
  ) {
    let url = this.environmentService.hydrate(window.query.url);
    let subscriptionUrl = this.environmentService.hydrate(
      window.query.subscriptionUrl
    );
    let query = this.environmentService.hydrate(window.query.query || '');
    let variables = this.environmentService.hydrate(window.variables.variables);
    let subscriptionConnectionParams = this.environmentService.hydrate(
      window.query.subscriptionConnectionParams
    );
    let headers = this.environmentService.hydrateHeaders(window.headers);

    if (transformedData) {
      url = this.environmentService.hydrate(window.query.url, {
        activeEnvironment: transformedData.environment,
      });
      subscriptionUrl = this.environmentService.hydrate(
        window.query.subscriptionUrl,
        {
          activeEnvironment: transformedData.environment,
        }
      );
      query = this.environmentService.hydrate(window.query.query || '', {
        activeEnvironment: transformedData.environment,
      });
      variables = this.environmentService.hydrate(window.variables.variables, {
        activeEnvironment: transformedData.environment,
      });
      subscriptionConnectionParams = this.environmentService.hydrate(
        window.query.subscriptionConnectionParams,
        {
          activeEnvironment: transformedData.environment,
        }
      );
      headers = this.environmentService.hydrateHeaders(window.headers, {
        activeEnvironment: transformedData.environment,
      });
    }

    return {
      url,
      subscriptionUrl,
      query,
      variables,
      headers,
      subscriptionConnectionParams,
    };
  }

  private async getWindowParentCollections(window: PerWindowState) {
    if (window.layout.windowIdInCollection && window.layout.collectionId) {
      const collection = await this.collectionService.getCollectionByID(
        window.layout.collectionId
      );

      if (collection) {
        const collections = [
          collection,
          ...(await this.collectionService.getAllParentCollections(collection)),
        ];

        return collections;
      }
    }

    return [];
  }
}
