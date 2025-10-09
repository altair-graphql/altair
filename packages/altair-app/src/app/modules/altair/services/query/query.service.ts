import { Injectable, inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../../store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { debug } from '../../utils/logger';
import { EnvironmentService } from '../environment/environment.service';
import { NotifyService } from '../notify/notify.service';
import { take } from 'rxjs/operators';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { PreRequestService } from '../pre-request/pre-request.service';
import { AUTHORIZATION_MAPPING } from '../../components/authorization/authorizations';
import {
  RequestType,
  FullTransformResult,
  SendRequestResponse,
} from 'altair-graphql-core/build/script/types';
import {
  HTTP_HANDLER_ID,
  WEBSOCKET_HANDLER_ID,
} from 'altair-graphql-core/build/request/types';
import { RequestHandlerRegistryService } from '../request/request-handler-registry.service';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private notifyService = inject(NotifyService);
  private environmentService = inject(EnvironmentService);
  private preRequestService = inject(PreRequestService);
  private requestHandlerRegistryService = inject(RequestHandlerRegistryService);
  private store = inject<Store<RootState>>(Store);


  getWindowState$(windowId: string) {
    return this.store.pipe(select(fromRoot.selectWindowState(windowId)));
  }

  async getWindowState(windowId: string) {
    return this.getWindowState$(windowId).pipe(take(1)).toPromise();
  }

  private getDefaultTransformResult(): FullTransformResult {
    return {
      combinedHeaders: [],
      requestScriptLogs: [],
      environment: this.environmentService.getActiveEnvironment(),
    };
  }

  /**
   * Gets pre-request transformed data when given script is executed
   * @param windowId
   * @param script
   * @param preTransformedData
   */
  async getPrerequestScriptResultForScript(
    windowId: string,
    script: string,
    preTransformedData: FullTransformResult
  ) {
    const state = await this.getWindowState(windowId);
    if (!state) {
      return preTransformedData;
    }

    const operationName = (state.query.selectedOperation ?? '').trim();
    const { query, variables, headers, extensions, url } =
      this.hydrateAllHydratables(state, preTransformedData);
    const environment = this.environmentService.mergeWithActiveEnvironment(
      preTransformedData?.environment ?? {}
    );

    /**
     * pre request execution context is passed the current headers, environment, variables, query, etc
     * and returns a set of the same that would have potentially been modified during the script execution.
     * The returned data is used instead of the original set of data
     */
    try {
      const transformedData = await this.preRequestService.executeScript(script, {
        environment,
        headers,
        operationName,
        query,
        variables,
        url,
        requestExtensions: extensions,
      });

      // merge preTransformedData with the new transformedData
      return {
        ...preTransformedData,
        ...transformedData,
      };
    } catch (err) {
      debug.error(err);
      this.notifyService.error(`Error executing pre-request script: ${err}`);

      return preTransformedData;
    }
  }

  private getCombinedHeaders(
    window: PerWindowState,
    collections: IQueryCollection[]
  ) {
    const combinedHeaders = collections.map((c) => c.headers || []).flat();
    return [...combinedHeaders, ...window.headers];
  }

  async getPrerequestTransformedData(windowId: string) {
    const state = await this.getWindowState(windowId);
    let preTransformedData = this.getDefaultTransformResult();

    if (!state) {
      // no state, no transformations
      return preTransformedData;
    }
    const collections = await this.getWindowParentCollections(state.windowId);

    // Headers
    preTransformedData.combinedHeaders = this.getCombinedHeaders(state, collections);

    // environment variables
    preTransformedData.environment =
      this.environmentService.getActiveEnvironment(collections);

    // pre-request scripts
    const collectionsWithEnabledPrerequests = collections.filter(
      (collection) => collection.preRequest?.enabled
    );
    for (const collection of collectionsWithEnabledPrerequests) {
      preTransformedData = await this.getPrerequestScriptResultForScript(
        windowId,
        collection.preRequest?.script ?? '',
        preTransformedData
      );
    }
    if (state?.preRequest.enabled) {
      preTransformedData = await this.getPrerequestScriptResultForScript(
        windowId,
        state.preRequest.script,
        preTransformedData
      );
    }

    // authorization
    if (
      state?.authorization &&
      fromRoot.isAuthorizationEnabled(state.authorization)
    ) {
      // Execute auth provider after pre-request script, if set
      const AuthProviderClass =
        await AUTHORIZATION_MAPPING[state.authorization.type].getProviderClass?.();
      if (AuthProviderClass) {
        const authProvider = new AuthProviderClass((data) =>
          this.environmentService.hydrate(data, {
            activeEnvironment: preTransformedData?.environment,
          })
        );
        const authData = state.authorization.data;
        const authResult = await authProvider.execute({
          data: authData,
        });
        const authHeaders = Object.entries(authResult.headers).map(
          ([key, value]) => ({ key, value, enabled: true })
        );

        preTransformedData.combinedHeaders = [
          ...(preTransformedData?.combinedHeaders ?? []),
          ...authHeaders,
        ];
      }
    }

    return preTransformedData;
  }

  async getPostRequestTransformedDataForScript(
    windowId: string,
    script: string,
    requestType: RequestType,
    data: SendRequestResponse,
    preTransformedData: FullTransformResult
  ): Promise<FullTransformResult> {
    const state = await this.getWindowState(windowId);
    if (!state) {
      return preTransformedData;
    }

    const operationName = (state.query.selectedOperation ?? '').trim();
    const environment = this.environmentService.mergeWithActiveEnvironment(
      preTransformedData?.environment ?? {}
    );
    const { query, headers, variables, extensions, url } =
      this.hydrateAllHydratables(state, preTransformedData);

    try {
      const transformedData = await this.preRequestService.executeScript(script, {
        environment,
        headers,
        operationName,
        query,
        variables,
        url,
        requestExtensions: extensions,
        requestType,
        response: data,
      });

      // merge preTransformedData with the new transformedData
      return {
        ...preTransformedData,
        ...transformedData,
      };
    } catch (err) {
      debug.error(err);
      this.notifyService.error(`Error executing post-request script: ${err}`);

      return preTransformedData;
    }
  }

  async getPostRequestTransformedData(
    windowId: string,
    requestType: RequestType,
    data: SendRequestResponse,
    preTransformedData = this.getDefaultTransformResult()
  ) {
    const state = await this.getWindowState(windowId);
    if (!state) {
      return preTransformedData;
    }

    const collections = await this.getWindowParentCollections(state.windowId);

    const collectionsWithEnabledPostrequests = collections.filter(
      (collection) => collection.postRequest?.enabled
    );
    for (const collection of collectionsWithEnabledPostrequests) {
      preTransformedData = await this.getPostRequestTransformedDataForScript(
        windowId,
        collection.postRequest?.script ?? '',
        requestType,
        data,
        preTransformedData
      );
    }

    if (state?.postRequest.enabled) {
      preTransformedData = await this.getPostRequestTransformedDataForScript(
        windowId,
        state.postRequest.script,
        requestType,
        data,
        preTransformedData
      );
    }
    return preTransformedData;
  }

  hydrateAllHydratables(
    window: PerWindowState,
    transformResult: FullTransformResult
  ) {
    const activeEnvironment = transformResult.environment;
    const url = this.environmentService.hydrate(window.query.url, {
      activeEnvironment,
    });
    const subscriptionUrl = this.environmentService.hydrate(
      window.query.subscriptionUrl,
      {
        activeEnvironment,
      }
    );
    const query = this.environmentService.hydrate(
      (window.query.query ?? '').trim(),
      {
        activeEnvironment,
      }
    );
    const variables = this.environmentService.hydrate(window.variables.variables, {
      activeEnvironment,
    });
    const extensions = this.environmentService.hydrate(
      window.query.requestExtensions ?? '',
      {
        activeEnvironment,
      }
    );
    const subscriptionConnectionParams = this.environmentService.hydrate(
      window.query.subscriptionConnectionParams,
      {
        activeEnvironment,
      }
    );
    const requestHandlerAdditionalParams = this.environmentService.hydrate(
      window.query.requestHandlerAdditionalParams ?? '',
      {
        activeEnvironment,
      }
    );
    // Use transformed combined headers (combines window and collection headers)
    const headers = this.environmentService.hydrateHeaders(
      transformResult.combinedHeaders,
      {
        activeEnvironment,
      }
    );

    return {
      url,
      subscriptionUrl,
      query,
      variables,
      extensions,
      headers,
      subscriptionConnectionParams,
      requestHandlerAdditionalParams,
    };
  }

  private getRequestHandlerId(window: PerWindowState, isSubscription: boolean) {
    const defaultRequestHandlerId = window.query.requestHandlerId ?? HTTP_HANDLER_ID;

    if (isSubscription && !window.query.subscriptionUseDefaultRequestHandler) {
      return window.query.subscriptionRequestHandlerId ?? WEBSOCKET_HANDLER_ID;
    }

    return defaultRequestHandlerId;
  }
  async getRequestHandler(window: PerWindowState, isSubscription: boolean) {
    const requestHandlerId = this.getRequestHandlerId(window, isSubscription);

    const data = this.requestHandlerRegistryService.getHandlerData(requestHandlerId);
    return data.getHandler();
  }

  private getWindowParentCollections$(windowId: string) {
    return this.store.pipe(select(fromRoot.selectWindowParentCollections(windowId)));
  }

  private async getWindowParentCollections(windowId: string) {
    return firstValueFrom(this.getWindowParentCollections$(windowId));
  }
}
