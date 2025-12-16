import {
  distinctUntilChanged,
  map,
  filter,
  take,
  switchMap,
  timeout,
  catchError,
} from 'rxjs/operators';
import { Component, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, forkJoin, of, from, firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { v4 as uuid } from 'uuid';

import * as fromRoot from '../../store';

import * as queryActions from '../../store/query/query.action';
import * as dialogsActions from '../../store/dialogs/dialogs.action';
import * as layoutActions from '../../store/layout/layout.action';
import * as windowsActions from '../../store/windows/windows.action';
import * as windowsMetaActions from '../../store/windows-meta/windows-meta.action';
import * as settingsActions from '../../store/settings/settings.action';
import * as donationActions from '../../store/donation/donation.action';
import * as collectionActions from '../../store/collection/collection.action';
import * as collectionsMetaActions from '../../store/collections-meta/collections-meta.action';
import * as environmentsActions from '../../store/environments/environments.action';
import * as localActions from '../../store/local/local.action';
import * as accountActions from '../../store/account/account.action';

import { environment } from '../../../../../environments/environment';

import {
  WindowService,
  DonationService,
  ElectronAppService,
  KeybinderService,
  PluginRegistryService,
  QueryCollectionService,
  ThemeRegistryService,
  SharingService,
  FilesService,
  EnvironmentService,
  NotifyService,
  BannerService,
  DbService,
  WebExtensionsService,
} from '../../services';

import isElectron from 'altair-graphql-core/build/utils/is_electron';
import { debug } from '../../utils/logger';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PluginEventService } from '../../services/plugin/plugin-event.service';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import {
  CollectionState,
  IQuery,
  IQueryCollection,
  SortByOptions,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { WindowsMetaState } from 'altair-graphql-core/build/types/state/windows-meta.interfaces';
import {
  EnvironmentsState,
  EnvironmentState,
} from 'altair-graphql-core/build/types/state/environments.interfaces';
import { ICustomTheme } from 'altair-graphql-core/build/theme';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import { AltairPanel } from 'altair-graphql-core/build/plugin/panel';
import { externalLink, mapToKeyValueList, openFiles } from '../../utils';
import { AccountState } from 'altair-graphql-core/build/types/state/account.interfaces';
import { catchUselessObservableError } from '../../utils/errors';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import {
  WorkspaceId,
  WORKSPACES,
} from 'altair-graphql-core/build/types/state/workspace.interface';
import { getWorkspaces, WorkspaceOption } from '../../store';
import { CollectionsMetaState } from 'altair-graphql-core/build/types/state/collections-meta.interfaces';
import { QueryItemRevision, IdentityProvider } from '@altairgraphql/db';
import { consumeQueryParam } from '../../utils/url';
import { languagesSchema } from 'altair-graphql-core/build/config/languages';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-altair',
  templateUrl: './altair.component.html',
  standalone: false,
})
export class AltairComponent {
  private windowService = inject(WindowService);
  private store = inject<Store<RootState>>(Store);
  private translate = inject(TranslateService);
  private donationService = inject(DonationService);
  private electronApp = inject(ElectronAppService);
  private keybinder = inject(KeybinderService);
  private pluginRegistry = inject(PluginRegistryService);
  private pluginEvent = inject(PluginEventService);
  private collectionService = inject(QueryCollectionService);
  private themeRegistry = inject(ThemeRegistryService);
  private sharingService = inject(SharingService);
  private filesService = inject(FilesService);
  private environmentService = inject(EnvironmentService);
  private notifyService = inject(NotifyService);
  private bannerService = inject(BannerService);
  private dbService = inject(DbService);
  private webExtensionsService = inject(WebExtensionsService);
  private altairConfig = inject(AltairConfig);

  windowIds$: Observable<any[]>;
  settings$: Observable<SettingsState>;
  collection$: Observable<CollectionState>;
  collectionsMeta$: Observable<CollectionsMetaState>;
  sortedCollections$: Observable<IQueryCollection[]>;
  windowsMeta$: Observable<WindowsMetaState>;
  environments$: Observable<EnvironmentsState>;
  activeEnvironment$: Observable<EnvironmentState | undefined>;
  theme$: Observable<ICustomTheme | undefined>;
  themeDark$: Observable<ICustomTheme | undefined>;
  accentColor$: Observable<string | undefined>;
  account$: Observable<AccountState>;
  workspaces$: Observable<WorkspaceOption[]>;
  activeWindow$: Observable<PerWindowState | undefined>;

  windowIds: string[] = [];
  windows: WindowState = {};
  closedWindows: PerWindowState[] = [];
  activeWindowId = '';
  isElectron = isElectron;
  isWebApp: boolean;
  serverReady = environment.serverReady;
  authEnabled = true;
  isReady = false; // determines if the app is fully loaded. Assets, translations, etc.
  showDonationAlert = false;

  showImportCurlDialog = false;
  showEditCollectionDialog = false;
  showCollections = false;
  queryRevisionQueryId = '';

  appVersion = environment.version;

  cspNonce = '';

  sidebarPanels$: Observable<AltairPanel[]>;
  headerPanels$: Observable<AltairPanel[]>;

  constructor() {
    const windowService = this.windowService;
    const altairConfig = this.altairConfig;

    this.isWebApp = altairConfig.isWebApp;
    this.authEnabled = !altairConfig.options.disableAccount;
    this.cspNonce = altairConfig.cspNonce;
    this.settings$ = this.store
      .pipe(select('settings'))
      .pipe(distinctUntilChanged());
    this.theme$ = this.settings$.pipe(
      map((settings) => {
        // Get specified theme
        // Add deprecated theme options
        // Warn about deprecated theme options, with alternatives
        // Add theme config object from settings

        const selectedTheme = this.themeRegistry.getTheme(settings.theme) || {
          isSystem: true,
        };
        const deperecatedThemeConfig: ICustomTheme = {
          type: {
            fontSize: {
              ...(settings['theme.fontsize'] && {
                remBase: settings['theme.fontsize'],
              }),
            },
          },
          editor: {
            ...(settings['theme.editorFontSize'] && {
              fontSize: settings['theme.editorFontSize'],
            }),
            ...(settings['theme.editorFontFamily'] && {
              fontFamily: {
                default: settings['theme.editorFontFamily'],
              },
            }),
          },
        };
        const settingsThemeConfig = settings.themeConfig || {};

        return this.themeRegistry.mergeThemes(
          selectedTheme,
          deperecatedThemeConfig,
          settingsThemeConfig
        );
      })
    );
    this.themeDark$ = this.settings$.pipe(
      map((settings) => {
        // Get specified theme
        // Add deprecated theme options
        // Warn about deprecated theme options, with alternatives
        // Add theme config object from settings

        if (!settings['theme.dark']) {
          return;
        }

        const selectedTheme = (settings['theme.dark'] &&
          this.themeRegistry.getTheme(settings['theme.dark'])) || {
          isSystem: true,
        };
        const deperecatedThemeConfig: ICustomTheme = {
          type: {
            fontSize: {
              ...(settings['theme.fontsize'] && {
                remBase: settings['theme.fontsize'],
              }),
            },
          },
          editor: {
            ...(settings['theme.editorFontSize'] && {
              fontSize: settings['theme.editorFontSize'],
            }),
            ...(settings['theme.editorFontFamily'] && {
              fontFamily: {
                default: settings['theme.editorFontFamily'],
              },
            }),
          },
        };
        const settingsThemeConfig = settings['themeConfig.dark'] || {};

        return this.themeRegistry.mergeThemes(
          selectedTheme,
          deperecatedThemeConfig,
          settingsThemeConfig
        );
      })
    );
    this.collection$ = this.store.select('collection');
    this.collectionsMeta$ = this.store.select('collectionsMeta');
    this.windowsMeta$ = this.store.select('windowsMeta');
    this.environments$ = this.store.select('environments');
    this.account$ = this.store.select('account');
    this.workspaces$ = this.store.select(getWorkspaces);
    this.activeWindow$ = this.store.pipe(
      map((state) => {
        return state.windows[state.windowsMeta.activeWindowId];
      })
    );
    this.sortedCollections$ = this.store.select(fromRoot.selectSortedCollections);
    this.activeEnvironment$ = this.store.select(
      fromRoot.getActiveSubEnvironmentState
    );
    this.accentColor$ = this.store.select(fromRoot.selectEnvironmentAccentColor);
    this.sidebarPanels$ = this.store.select(fromRoot.getSidebarPanels);
    this.headerPanels$ = this.store.select(fromRoot.getHeaderPanels);

    this.setDefaultLanguage();
    this.setAvailableLanguages();

    const applicationLanguage = this.getAppLanguage();
    forkJoin([
      this.translate.use(applicationLanguage),
      this.store.pipe(
        take(1),
        switchMap((data) => {
          if (data.settings['plugin.list']) {
            data.settings['plugin.list'].forEach((pluginStr) => {
              const pluginInfo =
                this.pluginRegistry.getPluginInfoFromString(pluginStr);
              if (pluginInfo) {
                this.pluginRegistry.fetchPlugin(pluginInfo.name, pluginInfo);
              }
            });
          }
          // this.pluginRegistry.fetchPlugin('altair-graphql-plugin-graphql-explorer', { version: '0.0.6' });
          // this.pluginRegistry.fetchPlugin('altair-graphql-plugin-birdseye', {
          //   pluginSource: 'url',
          //   version: '0.0.4',
          //   url: 'http://localhost:8002/'
          // });
          return from(this.pluginRegistry.pluginsReady());
        }),
        // Only wait 7 seconds for plugins to be ready
        timeout(7000),
        catchError((_error) => of('Plugins were not ready on time!'))
      ),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.isReady = true;
        this.pluginEvent.emit('app-ready', true);
      });

    // Update the app translation if the language settings is changed.
    // TODO: Consider moving this into a settings effect.
    this.settings$
      .pipe(
        untilDestroyed(this),
        map((settings) => settings.language),
        filter((x) => !!x),
        distinctUntilChanged()
      )
      .subscribe((language) => {
        this.translate.use(language);
      });

    this.webExtensionsService.connect();
    this.electronApp.connect({
      importFileContent: (content) => {
        return this.windowService.importStringData(content).catch((err) => {
          debug.error(err);
          this.notifyService.errorWithError(err, 'Error importing file content');
        });
      },
      createNewWindow: () => this.newWindow(),
      closeCurrentWindow: () => {
        if (this.windowIds.length > 1) {
          this.removeWindow(this.activeWindowId);
        }
      },
      openUrl: (url) => {
        const u = new URL(url);
        switch (u.pathname) {
          case '/share':
            return this.sharingService.checkForShareUrl(url);
          case '/new': {
            const endpoint = consumeQueryParam('endpoint', url);
            if (!endpoint) {
              debug.error('No endpoint specified in the url', url);
              return;
            }
            return this.windowService.newWindow({ url: endpoint }).subscribe();
          }
          default:
            debug.error('Unknown url', url);
        }
      },
    });
    this.keybinder.connect();

    this.windowIds$ = this.store.select('windows').pipe(
      map((windows) => {
        return Object.keys(windows);
      })
    );

    this.store.pipe(untilDestroyed(this)).subscribe((data) => {
      this.windows = data.windows;
      this.windowIds = Object.keys(data.windows);
      this.closedWindows = data.local.closedWindows;
      this.showDonationAlert = data.donation.showAlert;

      this.showImportCurlDialog = data.windowsMeta.showImportCurlDialog;
      this.showEditCollectionDialog = data.windowsMeta.showEditCollectionDialog;

      // Set the window IDs in the meta state if it does not already exist
      if (data.windowsMeta.windowIds) {
        // Filter the IDs based on the windows that are valid.
        // This fixes issues with when windows are removed.
        // Before the effect gets the remove action, the store has already been updated.
        // While this is valid, it causes the component to try to retrieve the invalid window.
        this.windowIds = data.windowsMeta.windowIds.filter(
          (id) => !!(this.windows as any)[id]
        );
      } else {
        this.store.dispatch(
          new windowsMetaActions.SetWindowIdsAction({ ids: this.windowIds })
        );
      }

      this.activeWindowId = data.windowsMeta.activeWindowId;
      debug.log(data.windows, this.windowIds);

      // If the active window has not been set, default it
      if (
        this.windowIds.length &&
        (!this.activeWindowId || !data.windows[this.activeWindowId])
      ) {
        const firstWindowId = this.windowIds[0];
        if (firstWindowId) {
          this.store.dispatch(
            new windowsMetaActions.SetActiveWindowIdAction({
              windowId: firstWindowId,
            })
          );
        }
      }
    });

    if (!this.windowIds.length) {
      if (altairConfig.options.initialWindows?.length) {
        altairConfig.options.initialWindows.forEach((windowOption) => {
          windowService
            .importWindowData(
              {
                version: 1,
                windowName: windowOption.initialName ?? '',
                type: 'window',
                apiUrl: windowOption.endpointURL ?? '',
                headers: windowOption.initialHeaders
                  ? mapToKeyValueList(windowOption.initialHeaders)
                  : [],
                query: windowOption.initialQuery ?? '',
                subscriptionUrl: windowOption.subscriptionsEndpoint ?? '',
                variables: windowOption.initialVariables ?? '',
                postRequestScript: windowOption.initialPostRequestScript,
                postRequestScriptEnabled: !!windowOption.initialPostRequestScript,
                preRequestScript: windowOption.initialPreRequestScript,
                preRequestScriptEnabled: !!windowOption.initialPreRequestScript,
                subscriptionConnectionParams:
                  windowOption.initialSubscriptionsPayload
                    ? JSON.stringify(windowOption.initialSubscriptionsPayload)
                    : undefined,
                subscriptionRequestHandlerId:
                  windowOption.initialSubscriptionRequestHandlerId,
                requestHandlerId: windowOption.initialRequestHandlerId,
                requestHandlerAdditionalParams:
                  windowOption.initialRequestHandlerAdditionalParams
                    ? JSON.stringify(
                        windowOption.initialRequestHandlerAdditionalParams
                      )
                    : undefined,
                subscriptionUseDefaultRequestHandler:
                  !windowOption.initialSubscriptionRequestHandlerId,
                authorizationType: windowOption.initialAuthorization?.type,
                authorizationData: windowOption.initialAuthorization?.data,
              },
              {
                fixedTitle: true,
              }
            )
            .catch((err) => {
              debug.error(err);
              this.notifyService.errorWithError(err, 'Error importing window data');
            });
        });
      } else {
        this.newWindow();
      }
    }

    this.showcaseAiPlugin();
  }

  /**
   * Sets the default language
   */
  setDefaultLanguage() {
    // Set fallback language to default.json
    this.translate.setDefaultLang('default');
  }

  /**
   * Sets the available languages from config
   */
  setAvailableLanguages() {
    const availableLanguages = Object.values(languagesSchema.enum);
    this.translate.addLangs(availableLanguages);
  }

  /**
   * Checks if the specified language is available
   * @param language Language code
   */
  checkLanguageAvailability(language: string) {
    return this.translate.getLangs().includes(language);
  }

  /**
   * Gets the language to use for the app
   */
  getAppLanguage() {
    const defaultLanguage = this.translate.getDefaultLang();
    const clientLanguage = this.translate.getBrowserLang();
    const isClientLanguageAvailable =
      clientLanguage && this.checkLanguageAvailability(clientLanguage);

    return isClientLanguageAvailable && !this.altairConfig.isTranslateMode
      ? clientLanguage
      : defaultLanguage;
  }

  newWindow() {
    this.windowService
      .newWindow()
      .pipe(take(1), untilDestroyed(this))
      .subscribe(({ url, windowId }) => {
        this.store.dispatch(
          new windowsMetaActions.SetActiveWindowIdAction({ windowId })
        );

        if (url) {
          this.store.dispatch(
            new queryActions.SendIntrospectionQueryRequestAction(windowId)
          );
        }
      });
  }

  setActiveWindow(windowId: string) {
    this.windowService.setActiveWindow(windowId);
  }

  removeWindow(windowId: string) {
    if (this.windowIds.length > 1) {
      this.windowService
        .removeWindow(windowId)
        .pipe(untilDestroyed(this), catchUselessObservableError)
        .subscribe();
    }
  }

  duplicateWindow(windowId: string) {
    this.windowService.duplicateWindow(windowId).subscribe();
  }

  setWindowName({ windowId = '', windowName = '' }) {
    this.store.dispatch(
      new layoutActions.SetWindowNameAction(windowId, {
        title: windowName,
        setByUser: true,
      })
    );
  }

  repositionWindow({
    currentPosition,
    newPosition,
  }: {
    currentPosition: number;
    newPosition: number;
  }) {
    this.store.dispatch(
      new windowsMetaActions.RepositionWindowAction({
        currentPosition,
        newPosition,
      })
    );
  }

  setWindowIds(ids: string[]) {
    this.store.dispatch(new windowsMetaActions.SetWindowIdsAction({ ids }));
  }

  reopenClosedWindow() {
    this.store.dispatch(new windowsActions.ReopenClosedWindowAction());
  }

  exportBackupData() {
    this.store.dispatch(new windowsMetaActions.ExportBackupDataAction());
  }

  importBackupData() {
    this.store.dispatch(new windowsMetaActions.ImportBackupDataAction());
  }

  importWindow() {
    this.store.dispatch(new windowsActions.ImportWindowAction());
  }

  importWindowFromCurl(data: string) {
    this.store.dispatch(new windowsActions.ImportWindowFromCurlAction({ data }));
  }

  showSettingsDialog() {
    this.store.dispatch(
      new windowsMetaActions.ShowSettingsDialogAction({ value: true })
    );
  }

  hideSettingsDialog() {
    this.store.dispatch(
      new windowsMetaActions.ShowSettingsDialogAction({ value: false })
    );
  }

  setSettingsJson(settingsJson: string) {
    this.store.dispatch(
      new settingsActions.SetSettingsJsonAction({ value: settingsJson })
    );
  }

  setShowImportCurlDialog(value: boolean) {
    this.store.dispatch(
      new windowsMetaActions.ShowImportCurlDialogAction({ value })
    );
  }

  prettifyCode() {
    this.store.dispatch(new queryActions.PrettifyQueryAction(this.activeWindowId));
  }

  compressQuery() {
    this.store.dispatch(new queryActions.CompressQueryAction(this.activeWindowId));
  }

  clearEditor() {
    this.store.dispatch(new queryActions.SetQueryAction(``, this.activeWindowId));
  }

  copyAsCurl() {
    this.store.dispatch(new queryActions.CopyAsCurlAction(this.activeWindowId));
  }

  convertToNamedQuery() {
    this.store.dispatch(
      new queryActions.ConvertToNamedQueryAction(this.activeWindowId)
    );
  }

  refactorQuery() {
    this.store.dispatch(new queryActions.RefactorQueryAction(this.activeWindowId));
  }

  toggleHeader(isOpen: boolean) {
    this.store.dispatch(
      new dialogsActions.ToggleHeaderDialogAction(this.activeWindowId)
    );
  }

  toggleVariableDialog(isOpen = undefined) {
    this.store.dispatch(
      new dialogsActions.ToggleVariableDialogAction(this.activeWindowId)
    );
  }

  toggleRequestHandlerDialog(isOpen: boolean) {
    this.store.dispatch(
      new dialogsActions.ToggleRequestHandlerDialogAction(this.activeWindowId, {
        value: isOpen,
      })
    );
  }

  toggleHistoryDialog(isOpen: boolean) {
    this.store.dispatch(
      new dialogsActions.ToggleHistoryDialogAction(this.activeWindowId)
    );
  }

  toggleRequestExtensionsDialog(show: boolean) {
    this.store.dispatch(
      new dialogsActions.ToggleRequestExtensionsDialogAction(this.activeWindowId, {
        value: show,
      })
    );
  }

  togglePreRequestDialog(isOpen: boolean) {
    this.store.dispatch(
      new dialogsActions.TogglePreRequestDialogAction(this.activeWindowId)
    );
  }

  toggleEnvironmentManager(show: boolean) {
    this.store.dispatch(
      new windowsMetaActions.ShowEnvironmentManagerAction({ value: show })
    );
  }

  togglePluginManager(show: boolean) {
    this.store.dispatch(
      new windowsMetaActions.ShowPluginManagerAction({ value: show })
    );
  }

  updateBaseEnvironmentJson(opts: { value: string }) {
    this.store.dispatch(
      new environmentsActions.UpdateBaseEnvironmentJsonAction(opts)
    );
  }
  updateSubEnvironmentJson(opts: { id: string; value: string }) {
    this.store.dispatch(
      new environmentsActions.UpdateSubEnvironmentJsonAction(opts)
    );
  }
  updateSubEnvironmentTitle(opts: { id: string; value: string }) {
    this.store.dispatch(
      new environmentsActions.UpdateSubEnvironmentTitleAction(opts)
    );
  }

  addNewSubEnvironment() {
    this.store.dispatch(
      new environmentsActions.AddSubEnvironmentAction({ id: uuid() })
    );
  }
  deleteSubEnvironment(opts: { id: string }) {
    this.store.dispatch(new environmentsActions.DeleteSubEnvironmentAction(opts));
    this.selectActiveEnvironment();
  }
  selectActiveEnvironment(id?: string) {
    this.store.dispatch(
      new environmentsActions.SelectActiveSubEnvironmentAction({ id })
    );
  }
  repositionSubEnvironments({
    currentPosition,
    newPosition,
  }: {
    currentPosition: number;
    newPosition: number;
  }) {
    this.store.dispatch(
      new environmentsActions.RepositionSubEnvironmentAction({
        currentPosition,
        newPosition,
      })
    );
  }
  async importEnvironmentData() {
    const data = await openFiles({ accept: '.agx' });

    return data.map((content) => {
      this.environmentService.importEnvironmentData(JSON.parse(content));
    });
  }
  async exportEnvironment(environment: EnvironmentState) {
    if (
      await this.notifyService.confirm(
        'Reminder: Your environment data may contain sensitive information. Are you sure you want to export it?'
      )
    ) {
      this.environmentService.exportEnvironmentData(environment);
    }
  }

  toggleCollections() {
    this.showCollections = !this.showCollections;
  }

  loadCollections() {
    this.store.dispatch(new collectionActions.LoadCollectionsAction());
  }

  selectQueryFromCollection({
    query,
    collectionId,
    windowIdInCollection,
  }: {
    query: IQuery;
    collectionId: string;
    windowIdInCollection: string;
  }) {
    this.windowService
      .loadQueryFromCollection(query, collectionId, windowIdInCollection)
      .catch((err) => {
        debug.error(err);
        this.notifyService.errorWithError(
          err,
          'Error loading query from collection'
        );
      });
  }

  deleteQueryFromCollection({
    collectionId,
    query,
  }: {
    collectionId: string;
    query: IQuery;
  }) {
    this.store.dispatch(
      new collectionActions.DeleteQueryFromCollectionAction({
        collectionId,
        query,
      })
    );
  }

  deleteCollection({ collectionId }: { collectionId: string }) {
    this.store.dispatch(
      new collectionActions.DeleteCollectionAction({ collectionId })
    );
  }

  exportCollection({ collectionId }: { collectionId: string }) {
    this.store.dispatch(
      new collectionActions.ExportCollectionAction({ collectionId })
    );
  }

  importCollections() {
    this.store.dispatch(new collectionActions.ImportCollectionsAction());
  }

  syncCollections() {
    this.store.dispatch(new collectionActions.SyncRemoteCollectionsToLocalAction());
  }

  syncLocalCollectionToRemote({ collection }: { collection: IQueryCollection }) {
    this.store.dispatch(
      new collectionActions.SyncLocalCollectionToRemoteAction({ collection })
    );
  }

  toggleEditCollectionDialog({ collection }: { collection: IQueryCollection }) {
    this.store.dispatch(
      new collectionActions.SetActiveCollectionAction({ collection })
    );
    this.store.dispatch(
      new windowsMetaActions.ShowEditCollectionDialogAction({ value: true })
    );
  }

  setShowAddToCollectionDialog(value: boolean) {
    this.store.dispatch(
      new windowsMetaActions.ShowAddToCollectionDialogAction({
        value,
        windowId: this.activeWindowId,
      })
    );
  }

  setShowEditCollectionDialog(value: boolean) {
    this.store.dispatch(
      new windowsMetaActions.ShowEditCollectionDialogAction({ value })
    );
  }

  showQueryRevisions(queryId: string) {
    this.queryRevisionQueryId = queryId;
  }

  copyQueryShareLink(queryServerId: string) {
    this.sharingService.copyQueryShareUrl(queryServerId);
  }

  restoreQueryRevision(revision: QueryItemRevision) {
    this.store.dispatch(new queryActions.RestoreQueryRevisionAction(revision));
  }

  setShowAccountDialog(value: boolean) {
    this.store.dispatch(new windowsMetaActions.ShowAccountDialogAction({ value }));
  }

  setShowTeamsDialog(value: boolean) {
    this.store.dispatch(new windowsMetaActions.ShowTeamsDialogAction({ value }));
  }

  setShowUpgradeDialog(value: boolean) {
    this.store.dispatch(new windowsMetaActions.ShowUpgradeDialogAction({ value }));
  }

  loadTeams() {
    this.store.dispatch(new accountActions.LoadTeamsAction());
  }

  accountLogin(provider?: IdentityProvider) {
    this.store.dispatch(new accountActions.LoginAccountAction({ provider }));
  }

  logout() {
    this.store.dispatch(new accountActions.LogoutAccountAction());
  }

  createCollectionAndSaveQueryToCollection({
    queryName = '',
    collectionName = '',
    parentCollectionId = '',
    workspaceId = WORKSPACES.LOCAL,
  }) {
    this.store.dispatch(
      new collectionActions.CreateCollectionAndSaveQueryToCollectionAction({
        windowId: this.activeWindowId,
        windowTitle: queryName,
        collectionTitle: collectionName,
        parentCollectionId: parentCollectionId || undefined,
        workspaceId: new WorkspaceId(workspaceId),
      })
    );

    this.setShowAddToCollectionDialog(false);
  }

  saveQueryToCollection({ queryName = '', collectionId = '' }) {
    this.store.dispatch(
      new collectionActions.SaveQueryToCollectionAction({
        windowId: this.activeWindowId,
        collectionId,
        windowTitle: queryName,
      })
    );

    this.setShowAddToCollectionDialog(false);
  }

  updateCollection({ collection }: { collection: IQueryCollection }) {
    this.store.dispatch(
      new collectionActions.UpdateCollectionAction({
        collectionId: collection.id,
        collection,
      })
    );
  }

  sortCollections(sortBy: SortByOptions) {
    this.store.dispatch(
      new collectionsMetaActions.UpdateCollectionsSortByAction({ sortBy })
    );
  }

  sortCollectionQueries(sortBy: SortByOptions) {
    this.store.dispatch(
      new collectionsMetaActions.UpdateQueriesSortByAction({ sortBy })
    );
  }

  togglePanelActive(panel: AltairPanel) {
    this.store.dispatch(
      new localActions.SetPanelActiveAction({
        panelId: panel.id,
        isActive: !panel.isActive,
      })
    );
  }

  async fileDropped(files: FileList) {
    const file = files[0];
    if (!file) {
      debug.log('No file specified.');
      return;
    }

    await this.filesService.handleImportedFile(file);
  }

  hideDonationAlert() {
    this.store.dispatch(new donationActions.HideDonationAlertAction());
  }

  async showcaseAiPlugin() {
    const isAiPluginInstalled = await this.pluginRegistry.isPluginInSettings(
      'altair-graphql-plugin-ai'
    );
    if (isAiPluginInstalled) {
      return;
    }
    const aiPluginShowcased = await firstValueFrom(
      this.dbService.getItem('ai-plugin-showcased')
    );
    if (aiPluginShowcased) {
      return;
    }
    this.bannerService.addBanner('install-ai-plugin', {
      message: 'Get Altair AI Assistant today to supercharge your GraphQL workflow!',
      dismissible: true,
      type: 'info',
      icon: 'sparkles',
      onDismiss: () => {
        this.dbService.setItem('ai-plugin-showcased', true);
      },
      actions: [
        {
          label: 'Try Altair AI',
          handler: () => {
            this.pluginRegistry.addPluginToSettings('altair-graphql-plugin-ai');
            this.bannerService.removeBanner('install-ai-plugin');
            this.notifyService.info(
              'Altair AI Assistant has been added to your plugins! Restart Altair to complete the installation and see it in the sidebar. ✨'
            );
          },
        },
      ],
    });
  }

  openDonationPage(e: Event) {
    this.donationService.donated();
    externalLink(this.altairConfig.donation.url, e);
    this.hideDonationAlert();
  }

  openWebAppLimitationPost(e: Event) {
    externalLink(
      'https://sirmuel.design/altair-graphql-web-app-limitations-b671a0a460b8',
      e
    );
  }

  trackById<T extends { id: unknown }>(_index: number, item: T) {
    return item.id;
  }
}
