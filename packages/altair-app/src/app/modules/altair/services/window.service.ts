import { EMPTY, from } from 'rxjs';

import { tap, map, switchMap, take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { v4 as uuid } from 'uuid';

import * as fromQuery from '../store/query/query.reducer';

import * as fromRoot from '../store';

import * as queryActions from '../store/query/query.action';
import * as headerActions from '../store/headers/headers.action';
import * as variableActions from '../store/variables/variables.action';
import * as dialogsActions from '../store/dialogs/dialogs.action';
import * as windowActions from '../store/windows/windows.action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';
import * as preRequestActions from '../store/pre-request/pre-request.action';
import * as postRequestActions from '../store/post-request/post-request.action';
import * as streamActions from '../store/stream/stream.action';
import * as localActions from '../store/local/local.action';
import * as gqlSchemaActions from '../store/gql-schema/gql-schema.action';
import * as layoutActions from '../store/layout/layout.action';

import { getFileStr, mapToKeyValueList } from '../utils';
import { parseCurlToObj } from '../utils/curl';
import { debug } from '../utils/logger';
import { GqlService } from './gql/gql.service';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { ExportWindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import { QueryCollectionService } from './query-collection/query-collection.service';
import { NotifyService } from './notify/notify.service';
import { IQuery } from 'altair-graphql-core/build/types/state/collection.interfaces';

interface ImportWindowDataOptions {
  fixedTitle?: boolean;
}

@Injectable()
export class WindowService {
  constructor(
    private store: Store<RootState>,
    private gqlService: GqlService,
    private collectionService: QueryCollectionService,
    private notifyService: NotifyService
  ) {}

  newWindow(
    opts: {
      title?: string;
      url?: string;
      collectionId?: string;
      windowIdInCollection?: string;
      fixedTitle?: boolean;
    } = {}
  ) {
    return this.store.pipe(
      take(1),
      map((state) => {
        const url =
          opts.url ||
          fromQuery.getInitialState().url ||
          (state.windowsMeta.activeWindowId &&
            state.windows[state.windowsMeta.activeWindowId]?.query.url) ||
          '';

        const newWindow = {
          windowId: uuid(),
          title: opts.title ?? `Window ${Object.keys(state.windows).length + 1}`,
          url,
          collectionId: opts.collectionId,
          windowIdInCollection: opts.windowIdInCollection,
          fixedTitle: opts.fixedTitle,
        };

        this.store.dispatch(new windowActions.AddWindowAction(newWindow));

        this.setupWindow(newWindow.windowId);

        return newWindow;
      })
    );
  }

  removeWindow(windowId: string) {
    this.cleanupWindow(windowId);

    return this.store.pipe(
      take(1),
      tap((data) => {
        const window = data.windows[windowId];
        if (window) {
          this.store.dispatch(
            new localActions.PushClosedWindowToLocalAction({ window })
          );
        }
        this.store.dispatch(new windowActions.RemoveWindowAction({ windowId }));
      })
    );
  }

  duplicateWindow(windowId: string) {
    return this.store.pipe(
      take(1),
      tap((data) => {
        const window = data.windows[windowId];
        if (!window) {
          return;
        }
        const clonedWindow = { ...window };

        const windowData: ExportWindowState = {
          version: 1,
          type: 'window',
          query: clonedWindow.query.query ?? '',
          apiUrl: clonedWindow.query.url,
          variables: clonedWindow.variables.variables,
          subscriptionUrl: clonedWindow.query.subscriptionUrl,
          subscriptionConnectionParams:
            clonedWindow.query.subscriptionConnectionParams,
          subscriptionRequestHandlerId:
            clonedWindow.query.subscriptionRequestHandlerId,
          subscriptionUseDefaultRequestHandler:
            clonedWindow.query.subscriptionUseDefaultRequestHandler,
          requestHandlerId: clonedWindow.query.requestHandlerId,
          requestHandlerAdditionalParams:
            clonedWindow.query.requestHandlerAdditionalParams,
          headers: clonedWindow.headers,
          windowName: `${clonedWindow.layout.title} (Copy)`,
          preRequestScript: clonedWindow.preRequest.script,
          preRequestScriptEnabled: clonedWindow.preRequest.enabled,
          gqlSchema: clonedWindow.schema.schema,
        };

        return this.importWindowData(windowData);
      })
    );
  }

  getWindowExportData(windowId: string) {
    return this.store.pipe(
      take(1),
      map((state) => {
        const window = state.windows[windowId];
        if (!window) {
          return;
        }
        const clonedWindow = { ...window };

        // TODO: Check that there is data to be exported

        return {
          version: 1 as const,
          type: 'window' as const,
          query: clonedWindow.query.query ?? '',
          apiUrl: clonedWindow.query.url,
          variables: clonedWindow.variables.variables,
          subscriptionUrl: clonedWindow.query.subscriptionUrl,
          subscriptionConnectionParams:
            clonedWindow.query.subscriptionConnectionParams,
          headers: clonedWindow.headers,
          windowName: clonedWindow.layout.title,
          preRequestScript: clonedWindow.preRequest.script,
          preRequestScriptEnabled: clonedWindow.preRequest.enabled,
          postRequestScript: clonedWindow.postRequest.script,
          postRequestScriptEnabled: clonedWindow.postRequest.enabled,
        };
      })
    );
  }

  importWindowDataFromJson(data: string) {
    if (!data) {
      throw new Error('String is empty.');
    }

    try {
      return this.importWindowData(JSON.parse(data), { fixedTitle: true });
    } catch (err) {
      try {
        // For a period, the JSON data was URI encoded.
        // Maybe that is the problem with this data.
        debug.log('(Second attempt) Trying to decode JSON data...');
        return this.importWindowData(JSON.parse(decodeURIComponent(data)), {
          fixedTitle: true,
        });
      } catch (err) {
        debug.log('The file is invalid.', err);
      }
    }
  }

  async importWindowDataFromCurl(curlStr: string) {
    if (!curlStr) {
      throw new Error('String is empty.');
    }

    try {
      const curlObj = await parseCurlToObj(curlStr);
      const windowData: ExportWindowState = {
        version: 1,
        type: 'window',
        query: curlObj.body ? JSON.parse(curlObj.body).query : '',
        apiUrl: curlObj.url,
        variables: curlObj.body
          ? JSON.stringify(JSON.parse(curlObj.body).variables)
          : '',
        subscriptionUrl: '',
        subscriptionConnectionParams: '',
        headers: curlObj.headers ? mapToKeyValueList(curlObj.headers) : [],
        windowName: `cURL-${Date.now()}`,
        preRequestScript: '',
        preRequestScriptEnabled: false,
      };

      return this.importWindowData(windowData);
    } catch (err) {
      debug.log('The file is invalid.', err);
    }
  }

  /**
   * Import the window represented by the provided data string
   * @param data window data string
   */
  importWindowData(data: ExportWindowState, options: ImportWindowDataOptions = {}) {
    try {
      // Verify file's content
      if (!data) {
        throw new Error('Object is empty.');
      }
      if (!data.version || !data.type || data.type !== 'window') {
        throw new Error('File is not a valid Altair query file.');
      }

      // Importing window data...
      // Add new window
      // Set window name
      // Set API URL
      // Set query
      // Set headers
      // Set variables
      // Set subscription URL
      this.newWindow({
        title: data.windowName,
        url: data.apiUrl,
        collectionId: data.collectionId,
        windowIdInCollection: data.windowIdInCollection,
        fixedTitle: options.fixedTitle,
      }).subscribe((newWindow) => {
        const windowId = newWindow.windowId;

        this.updateWindowState(windowId, data);

        this.store.dispatch(
          new windowsMetaActions.SetActiveWindowIdAction({ windowId })
        );
      });
    } catch (err) {
      debug.log('Something went wrong while importing the data.', err);
    }
  }

  updateWindowState(windowId: string, data: ExportWindowState) {
    this.getWindowState(windowId)
      .pipe(take(1))
      .subscribe((window) => {
        this.store.dispatch(
          new layoutActions.SetWindowNameAction(windowId, {
            title: data.windowName,
            setByUser: true,
          })
        );
        if (data.apiUrl && data.apiUrl !== window?.query.url) {
          this.store.dispatch(
            new queryActions.SetUrlAction({ url: data.apiUrl }, windowId)
          );
          this.store.dispatch(
            new queryActions.SendIntrospectionQueryRequestAction(windowId)
          );
        }
        if (data.query) {
          this.store.dispatch(new queryActions.SetQueryAction(data.query, windowId));
        }
        if (data.headers.length) {
          this.store.dispatch(
            new headerActions.SetHeadersAction({ headers: data.headers }, windowId)
          );
        }
        if (data.variables) {
          this.store.dispatch(
            new variableActions.UpdateVariablesAction(data.variables, windowId)
          );
          this.store.dispatch(
            new dialogsActions.ToggleVariableDialogAction(windowId)
          );
        }
        if (data.subscriptionUrl) {
          this.store.dispatch(
            new queryActions.SetRequestHandlerInfoAction(windowId, {
              subscriptionUrl: data.subscriptionUrl,
            })
          );
        }
        if (data.subscriptionConnectionParams) {
          this.store.dispatch(
            new queryActions.SetSubscriptionConnectionParamsAction(windowId, {
              connectionParams: data.subscriptionConnectionParams,
            })
          );
        }
        if (data.subscriptionRequestHandlerId) {
          this.store.dispatch(
            new queryActions.SetRequestHandlerInfoAction(windowId, {
              subscriptionRequestHandlerId: data.subscriptionRequestHandlerId,
            })
          );
        }
        if (data.subscriptionUseDefaultRequestHandler) {
          this.store.dispatch(
            new queryActions.SetRequestHandlerInfoAction(windowId, {
              subscriptionUseDefaultRequestHandler:
                data.subscriptionUseDefaultRequestHandler,
            })
          );
        }
        if (data.requestHandlerId) {
          this.store.dispatch(
            new queryActions.SetRequestHandlerInfoAction(windowId, {
              requestHandlerId: data.requestHandlerId,
            })
          );
        }
        if (data.requestHandlerAdditionalParams) {
          this.store.dispatch(
            new queryActions.SetRequestHandlerInfoAction(windowId, {
              additionalParams: data.requestHandlerAdditionalParams,
            })
          );
        }
        if (data.preRequestScriptEnabled) {
          this.store.dispatch(
            new preRequestActions.SetPreRequestEnabledAction(windowId, {
              enabled: data.preRequestScriptEnabled,
            })
          );
        }
        if (data.preRequestScript) {
          this.store.dispatch(
            new preRequestActions.SetPreRequestScriptAction(windowId, {
              script: data.preRequestScript,
            })
          );
        }
        if (data.postRequestScriptEnabled) {
          this.store.dispatch(
            new postRequestActions.SetPostRequestEnabledAction(windowId, {
              enabled: data.postRequestScriptEnabled,
            })
          );
        }
        if (data.postRequestScript) {
          this.store.dispatch(
            new postRequestActions.SetPostRequestScriptAction(windowId, {
              script: data.postRequestScript,
            })
          );
        }
        if (data.gqlSchema) {
          this.store.dispatch(
            new gqlSchemaActions.SetSchemaAction(windowId, data.gqlSchema)
          );
        }
      });
  }

  /**
   * Parse data and import as identified type
   * @param dataStr data
   */
  importStringData(dataStr: string) {
    const invalidFileError = new Error('Invalid Altair window file.');
    const emptyWindowData: ExportWindowState = {
      version: 1,
      type: 'window',
      apiUrl: '',
      headers: [],
      preRequestScript: '',
      preRequestScriptEnabled: false,
      query: '',
      subscriptionUrl: '',
      subscriptionConnectionParams: '',
      variables: '{}',
      windowName: '',
    };

    try {
      let parsed: ExportWindowState;
      try {
        parsed = JSON.parse(dataStr);
      } catch (err) {
        parsed = JSON.parse(decodeURIComponent(dataStr));
      }

      if (parsed.type === 'window' && parsed.version === 1) {
        return this.importWindowData(parsed, { fixedTitle: true });
      }
      throw invalidFileError;
    } catch (err) {
      debug.log('Invalid Altair window file.', err);
      try {
        // Check if sdl file
        const schema = this.gqlService.sdlToSchema(dataStr);
        if (schema) {
          // Import only schema
          this.importWindowData({
            ...emptyWindowData,
            version: 1,
            type: 'window',
            gqlSchema: schema,
          });
          this.notifyService.success(
            'Successfully imported GraphQL schema. Open the docs section to view it.'
          );
          return;
        }
        throw invalidFileError;
      } catch (sdlError) {
        debug.log('Invalid SDL file.', sdlError);
        // Else check if graphql query
        const operations = this.gqlService.getOperations(dataStr);
        debug.log(operations);
        if (operations && operations.length) {
          // Import only query
          return this.importWindowData({
            ...emptyWindowData,
            version: 1,
            type: 'window',
            query: dataStr,
          });
        }
        throw invalidFileError;
      }
    }
  }

  /**
   * Handle the imported file
   */
  async handleImportedFile(files: FileList) {
    const file = files[0];
    if (!file) {
      debug.log('No file specified.');
      return;
    }
    const dataStr = await getFileStr(file);
    try {
      this.importStringData(dataStr);
    } catch (error) {
      debug.log('There was an issue importing the file.', error);
    }
  }

  loadQueryFromCollection(
    query: IQuery,
    collectionId: string,
    windowIdInCollection: string
  ) {
    this.store
      .pipe(
        select((state) => state.windows),
        take(1),
        switchMap((windows) => {
          const matchingOpenQueryWindowId = Object.keys(windows).find((windowId) => {
            return (
              windows[windowId]?.layout.windowIdInCollection === windowIdInCollection
            );
          });
          if (matchingOpenQueryWindowId) {
            this.setActiveWindow(matchingOpenQueryWindowId);
            return EMPTY;
          }
          this.importWindowData(
            { ...query, collectionId, windowIdInCollection },
            { fixedTitle: true }
          );

          return EMPTY;
        })
      )
      .subscribe();
  }

  setActiveWindow(windowId: string) {
    this.store.dispatch(
      new windowsMetaActions.SetActiveWindowIdAction({ windowId })
    );
  }

  /**
   * Carry out any necessary house cleaning tasks.
   */
  setupWindow(windowId: string) {
    // Validate that query is ACTUALLY in an existing collection
    this.getWindowState(windowId)
      .pipe(
        take(1),
        switchMap((data) => {
          if (data?.layout.collectionId && data?.layout.windowIdInCollection) {
            return from(
              this.collectionService.getCollectionByID(data.layout.collectionId)
            ).pipe(
              map((collection) => {
                if (collection) {
                  const query = collection.queries.find(
                    (q) => q.id === data.layout.windowIdInCollection
                  );
                  return !!query;
                }

                return false;
              })
            );
          }

          return EMPTY;
        })
      )
      .subscribe((isValidCollectionQuery) => {
        if (!isValidCollectionQuery) {
          this.store.dispatch(
            new layoutActions.SetWindowIdInCollectionAction(windowId, {})
          );
        }
      });

    this.store.dispatch(new streamActions.StopStreamClientAction(windowId));
    this.store.dispatch(new streamActions.StartStreamClientAction(windowId));

    this.store
      .pipe(
        take(1),
        map((data) => data.settings['schema.reloadOnStart'])
      )
      .subscribe((shouldReloadSchema) => {
        if (shouldReloadSchema) {
          this.store.dispatch(
            new queryActions.SendIntrospectionQueryRequestAction(windowId)
          );
        }
      });
  }

  private getWindowState(windowId: string) {
    return this.store.pipe(select(fromRoot.selectWindowState(windowId)));
  }
  private cleanupWindow(windowId: string) {
    this.store.dispatch(new streamActions.StopStreamClientAction(windowId));
  }
}
