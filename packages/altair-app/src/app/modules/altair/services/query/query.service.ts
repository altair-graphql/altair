import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../../store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { debug } from '../../utils/logger';
import { EnvironmentService } from '../environment/environment.service';
import { GqlService } from '../gql/gql.service';
import { NotifyService } from '../notify/notify.service';
import { take } from 'rxjs/operators';
import { QueryCollectionService } from '../query-collection/query-collection.service';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { PreRequestService } from '../pre-request/pre-request.service';
import { AUTHORIZATION_MAPPING } from '../../components/authorization/authorizations';
import {
  RequestType,
  ScriptTranformResult,
  SendRequestResponse,
} from 'altair-graphql-core/build/script/types';
import {
  HTTP_HANDLER_ID,
  WEBSOCKET_HANDLER_ID,
} from 'altair-graphql-core/build/request/types';
import { RequestHandlerRegistryService } from '../request/request-handler-registry.service';
import { isValidUrl, parseJson } from '../../utils';

/**
 * Validation result for query requests
 */
export interface QueryRequestValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Result of preparing query execution
 */
export interface QueryExecutionPreparationResult {
  selectedOperation?: string;
  operations?: any[];
  shouldContinue: boolean;
  isSubscriptionQuery: boolean;
  subscriptionUrlMissing?: boolean;
}

/**
 * Data needed for sending a query request
 */
export interface QueryRequestData {
  url: string;
  variables: string;
  headers: any[];
  extensions: string;
  query: string;
  subscriptionUrl: string;
  subscriptionConnectionParams: any;
  requestHandlerAdditionalParams: any;
  preRequestScriptLogs?: any[];
  handler: any;
}

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  constructor(
    private notifyService: NotifyService,
    private environmentService: EnvironmentService,
    private preRequestService: PreRequestService,
    private gqlService: GqlService,
    private collectionService: QueryCollectionService,
    private requestHandlerRegistryService: RequestHandlerRegistryService,
    private store: Store<RootState>
  ) {}

  getWindowState$(windowId: string) {
    return this.store.pipe(select(fromRoot.selectWindowState(windowId)));
  }

  async getWindowState(windowId: string) {
    return this.getWindowState$(windowId).pipe(take(1)).toPromise();
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
    preTransformedData?: ScriptTranformResult
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

  async getPrerequestTransformedData(windowId: string) {
    const state = await this.getWindowState(windowId);
    let preTransformedData: ScriptTranformResult | undefined;

    if (state?.preRequest.enabled) {
      const collections = await this.getWindowParentCollections(state);
      const collectionsWithEnabledPrerequests = collections.filter(
        (collection) => collection.preRequest?.enabled
      );

      for (const collection of collectionsWithEnabledPrerequests) {
        preTransformedData = await this.getPrerequestScriptTransformedDataForScript(
          windowId,
          collection.preRequest?.script ?? '',
          preTransformedData
        );
      }

      preTransformedData = await this.getPrerequestScriptTransformedDataForScript(
        windowId,
        state.preRequest.script,
        preTransformedData
      );
    }

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

        preTransformedData = preTransformedData ?? {
          additionalHeaders: [],
          requestScriptLogs: [],
        };
        preTransformedData.additionalHeaders = [
          ...(preTransformedData?.additionalHeaders ?? []),
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
    preTransformedData?: ScriptTranformResult
  ): Promise<ScriptTranformResult | undefined> {
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
    preTransformedData?: ScriptTranformResult
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
        collection.postRequest?.script ?? '',
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
    transformResult?: ScriptTranformResult
  ) {
    let url = this.environmentService.hydrate(window.query.url);
    let subscriptionUrl = this.environmentService.hydrate(
      window.query.subscriptionUrl
    );
    let query = this.environmentService.hydrate((window.query.query ?? '').trim());
    let variables = this.environmentService.hydrate(window.variables.variables);
    let extensions = this.environmentService.hydrate(
      window.query.requestExtensions ?? ''
    );
    let subscriptionConnectionParams = this.environmentService.hydrate(
      window.query.subscriptionConnectionParams
    );
    let requestHandlerAdditionalParams = this.environmentService.hydrate(
      window.query.requestHandlerAdditionalParams ?? ''
    );
    const combinedHeaders = [
      ...window.headers,
      ...(transformResult?.additionalHeaders ?? []),
    ];
    let headers = this.environmentService.hydrateHeaders(combinedHeaders);

    if (transformResult?.environment) {
      const activeEnvironment = transformResult.environment;
      url = this.environmentService.hydrate(window.query.url, {
        activeEnvironment,
      });
      subscriptionUrl = this.environmentService.hydrate(
        window.query.subscriptionUrl,
        {
          activeEnvironment,
        }
      );
      query = this.environmentService.hydrate(window.query.query ?? '', {
        activeEnvironment,
      });
      variables = this.environmentService.hydrate(window.variables.variables, {
        activeEnvironment,
      });
      extensions = this.environmentService.hydrate(
        window.query.requestExtensions ?? '',
        {
          activeEnvironment,
        }
      );
      subscriptionConnectionParams = this.environmentService.hydrate(
        window.query.subscriptionConnectionParams,
        {
          activeEnvironment,
        }
      );
      requestHandlerAdditionalParams = this.environmentService.hydrate(
        window.query.requestHandlerAdditionalParams ?? '',
        {
          activeEnvironment,
        }
      );
      headers = this.environmentService.hydrateHeaders(combinedHeaders, {
        activeEnvironment,
      });
    }

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

    debug.log('Request handler id', requestHandlerId);
    const data = this.requestHandlerRegistryService.getHandlerData(requestHandlerId);
    return data.getHandler();
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

  /**
   * Validates a query request before sending
   * @param url The query URL
   * @param variables The query variables
   * @param files The file variables
   */
  validateQueryRequest(
    url: string,
    variables: string,
    files: any[]
  ): QueryRequestValidationResult {
    // If the URL is not set or is invalid, return error
    if (!url || !isValidUrl(url)) {
      return {
        isValid: false,
        errorMessage: 'The URL is invalid!',
      };
    }

    // Validate JSON variables
    if (!parseJson(variables, null)) {
      return {
        isValid: false,
        errorMessage: 'The variables is not a valid JSON string!',
      };
    }

    // Validate file variables
    if (this.gqlService.hasInvalidFileVariable(files)) {
      return {
        isValid: false,
        errorMessage: `
          You have some invalid file variables.<br><br>
          You need to provide a file and file name, when uploading files.
          Check your files in the variables section.
        `,
      };
    }

    return { isValid: true };
  }

  /**
   * Prepares query execution by calculating selected operation and handling subscription checks
   * @param windowState The window state
   * @param query The query string
   */
  prepareQueryExecution(
    windowState: PerWindowState,
    query: string
  ): QueryExecutionPreparationResult {
    // Calculate selected operation
    const {
      selectedOperation,
      operations,
      error: selectedOperationError,
    } = this.gqlService.calculateSelectedOperation(windowState, query);
    
    if (selectedOperationError) {
      this.notifyService.error(selectedOperationError);
      return {
        shouldContinue: false,
        isSubscriptionQuery: false,
      };
    }

    const isSubscriptionQuery = this.gqlService.isSubscriptionQuery(
      query,
      windowState
    );

    // Check if subscription URL is missing for subscription queries
    const subscriptionUrlMissing = isSubscriptionQuery && !windowState.query.subscriptionUrl;

    return {
      selectedOperation: selectedOperation ?? '',
      operations,
      shouldContinue: true,
      isSubscriptionQuery,
      subscriptionUrlMissing,
    };
  }

  /**
   * Prepares all data needed for sending a query request
   * @param windowId The window ID
   * @param windowState The window state  
   * @param isSubscriptionQuery Whether this is a subscription query
   */
  async prepareQueryRequestData(
    windowId: string,
    windowState: PerWindowState,
    isSubscriptionQuery: boolean
  ): Promise<QueryRequestData> {
    const transformedData = await this.getPrerequestTransformedData(windowId);
    const handler = await this.getRequestHandler(windowState, isSubscriptionQuery);
    
    const hydratedData = this.hydrateAllHydratables(windowState, transformedData);

    return {
      ...hydratedData,
      preRequestScriptLogs: transformedData?.requestScriptLogs,
      handler,
    };
  }
}
