import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../../store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { debug } from '../../utils/logger';
import { EnvironmentService } from '../environment/environment.service';
import { GqlService, SendRequestResponse } from '../gql/gql.service';
import { NotifyService } from '../notify/notify.service';
import { RequestType, ScriptTranformResult } from '../pre-request/helpers';
import { take } from 'rxjs/operators';
import { QueryCollectionService } from '../query-collection/query-collection.service';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { PreRequestService } from '../pre-request/pre-request.service';
import { AUTHORIZATION_MAPPING } from '../../components/authorization/authorizations';

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
    private store: Store<RootState>
  ) {}

  calculateSelectedOperation(state: PerWindowState, query: string) {
    try {
      const queryEditorIsFocused = state.query.queryEditorState?.isFocused;
      const operationData = this.gqlService.getSelectedOperationData({
        query,
        selectedOperation: state.query.selectedOperation,
        selectIfOneOperation: true,
        queryCursorIndex: queryEditorIsFocused
          ? state.query.queryEditorState.cursorIndex
          : undefined,
      });
      if (operationData.requestSelectedOperationFromUser) {
        return {
          selectedOperation: '',
          operations: operationData.operations,
          error: `You have more than one query operations. You need to select the one you want to run from the dropdown.`,
        };
      }
      return {
        selectedOperation: operationData.selectedOperation,
        operations: operationData.operations,
      };
    } catch (err) {
      debug.error(err);
      return {
        selectedOperation: '',
        error: 'Could not select operation',
      };
    }
  }

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

    const query = (state.query.query ?? '').trim();
    const operationName = (state.query.selectedOperation ?? '').trim();
    const headers = state.headers;
    const variables = state.variables.variables;
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

    const query = (state.query.query ?? '').trim();
    const operationName = (state.query.selectedOperation ?? '').trim();
    const headers = state.headers;
    const variables = state.variables.variables;
    const environment = this.environmentService.mergeWithActiveEnvironment(
      preTransformedData?.environment ?? {}
    );

    try {
      const transformedData = await this.preRequestService.executeScript(script, {
        environment,
        headers,
        operationName,
        query,
        variables,
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
    let query = this.environmentService.hydrate(window.query.query ?? '');
    let variables = this.environmentService.hydrate(window.variables.variables);
    let subscriptionConnectionParams = this.environmentService.hydrate(
      window.query.subscriptionConnectionParams
    );
    let headers = this.environmentService.hydrateHeaders(window.headers);

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
      subscriptionConnectionParams = this.environmentService.hydrate(
        window.query.subscriptionConnectionParams,
        {
          activeEnvironment,
        }
      );
      headers = this.environmentService.hydrateHeaders(
        [...window.headers, ...transformResult.additionalHeaders],
        {
          activeEnvironment,
        }
      );
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
