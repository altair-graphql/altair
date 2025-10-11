import { Observable, zip, of, EMPTY, from } from 'rxjs';

import { switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';

import * as windowActions from '../store/windows/windows.action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';
import * as localActions from '../store/local/local.action';

import { WindowService } from '../services/window.service';

import { downloadJson, openFile } from '../utils';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { debug } from '../utils/logger';
import { windowHasUnsavedChanges } from '../store';
import { APP_INIT_ACTION } from '../store/action';
import { SharingService } from '../services';

@Injectable()
export class WindowsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject<Store<RootState>>(Store);
  private readonly windowService = inject(WindowService);
  private readonly sharingService = inject(SharingService);

  // Updates windowsMeta with window IDs when a window is added
  addWindowID$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(windowActions.ADD_WINDOW),
      withLatestFrom(this.store, (action: windowActions.AddWindowAction, state) => {
        return {
          windows: state.windows,
          windowIds: state.windowsMeta.windowIds,
          action,
        };
      }),
      switchMap((data) => {
        const windowIds = Object.keys(data.windows);
        const metaWindowIds = data.windowIds;
        const newWindowIds = [
          ...metaWindowIds,
          ...windowIds.filter((id) => !metaWindowIds.includes(id)),
        ];

        return of(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
      })
    );
  });

  // Updates windowsMeta with window IDs when a window is removed
  removeWindowID$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(windowActions.REMOVE_WINDOW),
      withLatestFrom(
        this.store,
        (action: windowActions.RemoveWindowAction, state) => {
          return {
            windows: state.windows,
            windowIds: state.windowsMeta.windowIds,
            action,
          };
        }
      ),
      switchMap((data) => {
        const windowIds = Object.keys(data.windows);
        const metaWindowIds = data.windowIds;
        const newWindowIds = metaWindowIds.filter((id) => windowIds.includes(id));
        return of(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
      })
    );
  });

  reopenClosedWindow$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(windowActions.REOPEN_CLOSED_WINDOW),
      withLatestFrom(
        this.store,
        (action: windowActions.ReopenClosedWindowAction, state) => {
          return {
            closedWindows: state.local.closedWindows,
            windows: state.windows,
            windowIds: state.windowsMeta.windowIds,
            action,
          };
        }
      ),
      switchMap((data) => {
        const lastClosedWindow = data.closedWindows[data.closedWindows.length - 1];
        if (!lastClosedWindow || !lastClosedWindow.windowId) {
          return EMPTY;
        }

        const lastClosedWindowId = lastClosedWindow.windowId;
        const windows = data.windows;
        if (windows[lastClosedWindowId]) {
          return EMPTY;
        }

        windows[lastClosedWindowId] = lastClosedWindow;
        this.store.dispatch(
          new windowActions.SetWindowsAction(Object.values(windows))
        );
        this.windowService.setupWindow(lastClosedWindowId);
        const newWindowIds = [...data.windowIds, lastClosedWindowId];
        this.store.dispatch(
          new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds })
        );
        return of(
          new windowsMetaActions.SetActiveWindowIdAction({
            windowId: lastClosedWindowId,
          })
        );
      }),
      tap(() => {
        this.store.dispatch(new localActions.PopFromClosedWindowsAction());
      })
    );
  });

  // Exports the window data
  exportWindow$: Observable<Action> = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(windowActions.EXPORT_WINDOW),
        withLatestFrom(
          this.store,
          (action: windowActions.ExportWindowAction, state) => {
            return {
              data: state.windows[action.payload.windowId],
              windowId: action.payload.windowId,
              action,
            };
          }
        ),
        switchMap((data) => {
          return zip(
            of(data),
            this.windowService.getWindowExportData$(data.windowId)
          );
        }),
        switchMap(([data, exportData]) => {
          downloadJson(exportData, data.data?.layout.title, {
            fileType: 'agq',
          });
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  importWindow$: Observable<Action> = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(windowActions.IMPORT_WINDOW),
        switchMap((action) => {
          return from(openFile({ accept: '.agq' }));
        }),
        switchMap((data) => {
          return from(this.windowService.importWindowDataFromJson(data));
        }),
        switchMap(() => {
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  importWindowFromCurl$: Observable<Action> = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(windowActions.IMPORT_WINDOW_FROM_CURL),
        switchMap((action: windowActions.ImportWindowFromCurlAction) => {
          if (action.payload) {
            this.windowService.importWindowDataFromCurl(action.payload.data);
          }
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  reloadCollectionWindows$: Observable<Action> = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(windowActions.RELOAD_COLLECTION_WINDOWS),
        withLatestFrom(
          this.store,
          (action: windowActions.ReloadCollectionWindowsAction, state) => {
            return {
              windows: state.windows,
              collection: state.collection,
              action,
            };
          }
        ),
        switchMap((data) => {
          Object.values(data.windows).forEach((window) => {
            if (!window.layout.collectionId || !window.layout.windowIdInCollection) {
              return;
            }
            const collection = data.collection.list.find(
              (c) => c.id === window.layout.collectionId
            );
            const payload = collection?.queries.find(
              (q) => q.id === window.layout.windowIdInCollection
            );

            if (payload && !windowHasUnsavedChanges(window, data.collection.list)) {
              this.windowService
                .updateWindowState(window.windowId, payload)
                .catch((err) => {
                  debug.error(err);
                });
            }
          });
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  checkShareUrls$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(APP_INIT_ACTION),
        switchMap(() => {
          // check for shared links
          this.sharingService.checkForShareUrl();
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );
}
