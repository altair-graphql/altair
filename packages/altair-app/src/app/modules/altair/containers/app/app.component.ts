import { first, distinctUntilChanged, map, filter, take, switchMap, timeout, catchError } from 'rxjs/operators';
import { Component, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, forkJoin, of, from } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import uuid from 'uuid/v4';

import * as fromRoot from '../../store';
import * as fromCollection from '../../store/collection/collection.reducer';
import * as fromWindowsMeta from '../../store/windows-meta/windows-meta.reducer';
import * as fromEnvironments from '../../store/environments/environments.reducer';
import * as fromWindows from '../../store/windows/windows.reducer';

import * as queryActions from '../../store/query/query.action';
import * as dialogsActions from '../../store/dialogs/dialogs.action';
import * as layoutActions from '../../store/layout/layout.action';
import * as docsActions from '../../store/docs/docs.action';
import * as windowsActions from '../../store/windows/windows.action';
import * as windowsMetaActions from '../../store/windows-meta/windows-meta.action';
import * as settingsActions from '../../store/settings/settings.action';
import * as donationActions from '../../store/donation/donation.action';
import * as windowActions from '../../store/windows/windows.action';
import * as collectionActions from '../../store/collection/collection.action';
import * as environmentsActions from '../../store/environments/environments.action';
import * as localActions from '../../store/local/local.action';

import { environment } from '../../../../../environments/environment';

import {
  WindowService,
  DonationService,
  ElectronAppService,
  KeybinderService,
  PluginRegistryService,
  QueryCollectionService,
  ThemeRegistryService,
} from '../../services';

import isElectron from 'altair-graphql-core/build/utils/is_electron';
import { debug } from '../../utils/logger';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PluginEventService } from '../../services/plugin/plugin-event.service';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { CollectionState, IQuery, IQueryCollection, SortByOptions } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { WindowsMetaState } from 'altair-graphql-core/build/types/state/windows-meta.interfaces';
import { EnvironmentsState, EnvironmentState } from 'altair-graphql-core/build/types/state/environments.interfaces';
import { ICustomTheme } from 'altair-graphql-core/build/theme';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import { AltairPanel } from 'altair-graphql-core/build/plugin/panel';
import { externalLink, openFile } from '../../utils';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-altair',
  templateUrl: './app.component.html',
})
export class AppComponent  {
  windowIds$: Observable<any[]>;
  settings$: Observable<SettingsState>;
  collection$: Observable<CollectionState>;
  sortedCollections$: Observable<any[]>;
  windowsMeta$: Observable<WindowsMetaState>;
  environments$: Observable<EnvironmentsState>;
  activeEnvironment$: Observable<EnvironmentState | undefined>;
  theme$: Observable<ICustomTheme | undefined>;
  themeDark$: Observable<ICustomTheme | undefined>;

  windowIds: string[] = [];
  windows: WindowState = {};
  closedWindows: any[] = [];
  activeWindowId = '';
  isElectron = isElectron;
  isWebApp: boolean;
  isReady = false; // determines if the app is fully loaded. Assets, translations, etc.
  showDonationAlert = false;

  showImportCurlDialog = false;
  showEditCollectionDialog = false;
  showCollections = false;

  appVersion = environment.version;

  sidebarPanels$: Observable<AltairPanel[]>;
  headerPanels$: Observable<AltairPanel[]>;

  constructor(
    private windowService: WindowService,
    private store: Store<RootState>,
    private translate: TranslateService,
    private donationService: DonationService,
    private electronApp: ElectronAppService,
    private keybinder: KeybinderService,
    private pluginRegistry: PluginRegistryService,
    private pluginEvent: PluginEventService,
    private collectionService: QueryCollectionService,
    private themeRegistry: ThemeRegistryService,
    private altairConfig: AltairConfig,
  ) {
    this.isWebApp = altairConfig.isWebApp;
    this.settings$ = this.store.pipe(select('settings')).pipe(distinctUntilChanged());
    this.theme$ = this.settings$.pipe(
      map((settings) => {
        // Get specified theme
        // Add deprecated theme options
        // Warn about deprecated theme options, with alternatives
        // Add theme config object from settings

        const selectedTheme = this.themeRegistry.getTheme(settings.theme) || { isSystem: true };
        const deperecatedThemeConfig: ICustomTheme = {
          type: {
            fontSize: {
              ...(settings['theme.fontsize'] && {
                remBase: settings['theme.fontsize'],
              }),
            }
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
          }
        };
        const settingsThemeConfig = settings.themeConfig || {};

        return this.themeRegistry.mergeThemes(selectedTheme, deperecatedThemeConfig, settingsThemeConfig);
      })
    );
    this.themeDark$ = this.settings$.pipe(
      map((settings) => {
        // Get specified theme
        // Add deprecated theme options
        // Warn about deprecated theme options, with alternatives
        // Add theme config object from settings

        const selectedTheme = settings['theme.dark'] && this.themeRegistry.getTheme(settings['theme.dark']) || { isSystem: true };
        const deperecatedThemeConfig: ICustomTheme = {
          type: {
            fontSize: {
              ...(settings['theme.fontsize'] && {
                remBase: settings['theme.fontsize'],
              }),
            }
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
          }
        };
        const settingsThemeConfig = settings['themeConfig.dark'] || {};

        return this.themeRegistry.mergeThemes(selectedTheme, deperecatedThemeConfig, settingsThemeConfig);
      })
    );
    this.collection$ = this.store.select('collection');
    this.windowsMeta$ = this.store.select('windowsMeta');
    this.environments$ = this.store.select('environments');
    this.sortedCollections$ = this.store.select(fromRoot.selectSortedCollections);
    this.activeEnvironment$ = this.environments$.pipe(
      map(environments => {
        if (environments.activeSubEnvironment) {
          return environments.subEnvironments.find(subEnvironment => subEnvironment.id === environments.activeSubEnvironment);
        }
        return;
      })
    );
    this.sidebarPanels$ = this.store.select(fromRoot.getSidebarPanels);
    this.headerPanels$ = this.store.select(fromRoot.getHeaderPanels);

    this.setDefaultLanguage();
    this.setAvailableLanguages();

    const applicationLanguage = this.getAppLanguage();
    // TODO: Replace since it is deprecated
    forkJoin([
      this.translate.use(applicationLanguage),
      this.store.pipe(
        take(1),
        switchMap(data => {
          if (data.settings['plugin.list']) {
            data.settings['plugin.list'].forEach(pluginStr => {
              const pluginInfo = this.pluginRegistry.getPluginInfoFromString(pluginStr);
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
        catchError(error => of('Plugins were not ready on time!')),
      ),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.isReady = true;
        this.pluginEvent.emit('app-ready', true);
      });

    // Update the app translation if the language settings is changed.
    // TODO: Consider moving this into a settings effect.
    this.settings$.pipe(
      map(settings => settings.language),
      filter(x => !!x),
      distinctUntilChanged(),
      untilDestroyed(this),
    )
    .subscribe(language => {
      this.translate.use(language);
    });

    this.electronApp.connect();
    this.keybinder.connect();

    this.windowIds$ = this.store.select('windows').pipe(map(windows => {
      return Object.keys(windows);
    }));

    this.store
      .pipe(untilDestroyed(this))
      .subscribe(data => {
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
          this.windowIds = data.windowsMeta.windowIds.filter(id => !!(this.windows as any)[id]);
        } else {
          this.store.dispatch(new windowsMetaActions.SetWindowIdsAction( { ids: this.windowIds }));
        }

        this.activeWindowId = data.windowsMeta.activeWindowId;
        debug.log(data.windows, this.windowIds);

        // If the active window has not been set, default it
        if (this.windowIds.length && (!this.activeWindowId || !data.windows[this.activeWindowId])) {
          this.store.dispatch(new windowsMetaActions.SetActiveWindowIdAction({ windowId: this.windowIds[0] }));
        }
      });

    if (!this.windowIds.length) {
      this.newWindow();
    }
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
    const availableLanguages = Object.keys(this.altairConfig.languages);
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
    const isClientLanguageAvailable = this.checkLanguageAvailability(clientLanguage);

    return isClientLanguageAvailable && !this.altairConfig.isTranslateMode ? clientLanguage : defaultLanguage;
  }

  newWindow() {
    this.windowService.newWindow()
    .pipe(
      first(),
      untilDestroyed(this),
    )
    .subscribe(({ url, windowId }) => {
      this.store.dispatch(new windowsMetaActions.SetActiveWindowIdAction({ windowId }));

      if (url) {
        this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(windowId));
      }
    });
  }

  setActiveWindow(windowId: string) {
    this.store.dispatch(new windowsMetaActions.SetActiveWindowIdAction({ windowId }));
  }

  removeWindow(windowId: string) {
    this.windowService.removeWindow(windowId)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  duplicateWindow(windowId: string) {
    this.windowService.duplicateWindow(windowId);
  }

  setWindowName({ windowId = '', windowName = '' }) {
    this.store.dispatch(new layoutActions.SetWindowNameAction(windowId, { title: windowName, setByUser: true }));
  }

  repositionWindow({ currentPosition, newPosition }: { currentPosition: number, newPosition: number }) {
    this.store.dispatch(new windowsMetaActions.RepositionWindowAction({ currentPosition, newPosition }));
  }

  reopenClosedWindow() {
    this.store.dispatch(new windowActions.ReopenClosedWindowAction());
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
    this.store.dispatch(new windowsMetaActions.ShowSettingsDialogAction({ value: true }));
  }

  hideSettingsDialog() {
    this.store.dispatch(new windowsMetaActions.ShowSettingsDialogAction({ value: false }));
  }

  setSettingsJson(settingsJson: string) {
    this.store.dispatch(new settingsActions.SetSettingsJsonAction({ value: settingsJson }));
  }

  setShowImportCurlDialog(value: boolean) {
    this.store.dispatch(new windowsMetaActions.ShowImportCurlDialogAction({ value }));
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
    this.store.dispatch(new queryActions.ConvertToNamedQueryAction(this.activeWindowId));
  }

  refactorQuery() {
    this.store.dispatch(new queryActions.RefactorQueryAction(this.activeWindowId));
  }

  toggleHeader(isOpen: boolean) {
    this.store.dispatch(new dialogsActions.ToggleHeaderDialogAction(this.activeWindowId));
  }

  toggleVariableDialog(isOpen = undefined) {
    this.store.dispatch(new dialogsActions.ToggleVariableDialogAction(this.activeWindowId));
  }

  toggleSubscriptionUrlDialog(isOpen: boolean) {
    this.store.dispatch(new dialogsActions.ToggleSubscriptionUrlDialogAction(this.activeWindowId));
  }

  toggleHistoryDialog(isOpen: boolean) {
    this.store.dispatch(new dialogsActions.ToggleHistoryDialogAction(this.activeWindowId));
  }

  togglePreRequestDialog(isOpen: boolean) {
    this.store.dispatch(new dialogsActions.TogglePreRequestDialogAction(this.activeWindowId));
  }

  toggleEnvironmentManager(show: boolean) {
    this.store.dispatch(new windowsMetaActions.ShowEnvironmentManagerAction({ value: show }));
  }

  togglePluginManager(show: boolean) {
    this.store.dispatch(new windowsMetaActions.ShowPluginManagerAction({ value: show }));
  }

  updateBaseEnvironmentJson(opts: { value: string }) {
    this.store.dispatch(new environmentsActions.UpdateBaseEnvironmentJsonAction(opts));
  }
  updateSubEnvironmentJson(opts: { id: string, value: string }) {
    this.store.dispatch(new environmentsActions.UpdateSubEnvironmentJsonAction(opts));
  }
  updateSubEnvironmentTitle(opts: { id: string, value: string }) {
    this.store.dispatch(new environmentsActions.UpdateSubEnvironmentTitleAction(opts));
  }

  addNewSubEnvironment() {
    this.store.dispatch(new environmentsActions.AddSubEnvironmentAction({ id: uuid() }));
  }
  deleteSubEnvironment(opts: { id: string }) {
    this.store.dispatch(new environmentsActions.DeleteSubEnvironmentAction(opts));
    this.selectActiveEnvironment();
  }
  selectActiveEnvironment(id?: string) {
    this.store.dispatch(new environmentsActions.SelectActiveSubEnvironmentAction({ id }));
  }
  repositionSubEnvironments({ currentPosition, newPosition }: { currentPosition: number, newPosition: number }) {
    this.store.dispatch(new environmentsActions.RepositionSubEnvironmentAction({ currentPosition, newPosition }));
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
    windowIdInCollection
  }: { query: IQuery, collectionId: number, windowIdInCollection: string }) {
    const matchingOpenQueryWindowIds = Object.keys(this.windows).filter(windowId => {
      return this.windows[windowId].layout.windowIdInCollection === windowIdInCollection;
    });
    if (matchingOpenQueryWindowIds.length) {
      this.setActiveWindow(matchingOpenQueryWindowIds[0]);
      return;
    }
    this.windowService.importWindowData({ ...query, collectionId, windowIdInCollection }, { fixedTitle: true });
  }

  deleteQueryFromCollection({ collectionId, query }: { collectionId: number, query: IQuery }) {
   this.store.dispatch(new collectionActions.DeleteQueryFromCollectionAction({ collectionId, query }));
  }

  deleteCollection({ collectionId }: { collectionId: number }) {
    this.store.dispatch(new collectionActions.DeleteCollectionAction({ collectionId }));
  }

  exportCollection({ collectionId }: { collectionId: number }) {
    this.store.dispatch(new collectionActions.ExportCollectionAction({ collectionId }));
  }

  importCollections() {
    this.store.dispatch(new collectionActions.ImportCollectionsAction());
  }

  toggleEditCollectionDialog({ collection }: { collection: IQueryCollection }) {
    this.store.dispatch(new collectionActions.SetActiveCollectionAction({ collection }));
    this.store.dispatch(new windowsMetaActions.ShowEditCollectionDialogAction({ value: true }));
  }

  setShowEditCollectionDialog(value: boolean) {
    this.store.dispatch(new windowsMetaActions.ShowEditCollectionDialogAction({ value }));
  }

  updateCollection({ collection }: { collection: IQueryCollection & { id: number } }) {
    this.store.dispatch(new collectionActions.UpdateCollectionAction({ collectionId: collection.id, collection }));
  }

  sortCollections({ sortBy = '' as SortByOptions }) {
    this.store.dispatch(new collectionActions.SortCollectionsAction({ sortBy }));
  }

  togglePanelActive(panel: AltairPanel) {
    this.store.dispatch(new localActions.SetPanelActiveAction({ panelId: panel.id, isActive: !panel.isActive }));
  }

  async fileDropped(files: FileList) {
    if (files && files.length) {
      try {
        // Handle window import
        await this.windowService.handleImportedFile(files);
      } catch (error) {
        debug.log(error);
        try {
          // Handle collection import
          await this.collectionService.handleImportedFile(files)
        } catch (collectionError) {
          debug.log(collectionError);
        }
      }
    }
  }

  hideDonationAlert() {
    this.store.dispatch(new donationActions.HideDonationAlertAction());
  }

  openDonationPage(e: Event) {
    this.donationService.donated();
    externalLink(e, this.altairConfig.donation.url);
    this.hideDonationAlert();
  }

  openWebAppLimitationPost(e: Event) {
    externalLink(e, 'https://sirmuel.design/altair-graphql-web-app-limitations-b671a0a460b8');
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
