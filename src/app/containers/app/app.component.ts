import { first, distinctUntilChanged, map, filter } from 'rxjs/operators';
import { Component, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import * as uuid from 'uuid/v4';

import * as fromRoot from '../../reducers';
import * as fromHeader from '../../reducers/headers/headers';
import * as fromVariable from '../../reducers/variables/variables';
import * as fromSettings from '../../reducers/settings/settings';
import * as fromCollection from '../../reducers/collection';
import * as fromWindowsMeta from '../../reducers/windows-meta/windows-meta';
import * as fromEnvironments from '../../reducers/environments';

import * as queryActions from '../../actions/query/query';
import * as headerActions from '../../actions/headers/headers';
import * as variableActions from '../../actions/variables/variables';
import * as dialogsActions from '../../actions/dialogs/dialogs';
import * as layoutActions from '../../actions/layout/layout';
import * as docsActions from '../../actions/docs/docs';
import * as windowsActions from '../../actions/windows/windows';
import * as windowsMetaActions from '../../actions/windows-meta/windows-meta';
import * as settingsActions from '../../actions/settings/settings';
import * as donationActions from '../../actions/donation';
import * as windowActions from '../../actions/windows/windows';
import * as collectionActions from '../../actions/collection/collection';
import * as environmentsActions from '../../actions/environments/environments';

import { environment } from '../../../environments/environment';

import { QueryService, GqlService, WindowService, DonationService, ElectronAppService, KeybinderService } from '../../services';

import config from '../../config';
import isElectron from '../../utils/is_electron';
import { debug } from 'app/utils/logger';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  windowIds$: Observable<any[]>;
  settings$: Observable<fromSettings.State>;
  collection$: Observable<fromCollection.State>;
  windowsMeta$: Observable<fromWindowsMeta.State>;
  environments$: Observable<fromEnvironments.State>;

  windowIds = [];
  windows = {};
  activeWindowId = '';
  isElectron = isElectron;
  isReady = false; // determines if the app is fully loaded. Assets, translations, etc.
  showDonationAlert = false;

  showImportCurlDialog = false;
  showEditCollectionDialog = false;
  showCollections = false;

  appVersion = environment.version;

  constructor(
    private windowService: WindowService,
    private store: Store<fromRoot.State>,
    private translate: TranslateService,
    private donationService: DonationService,
    private electronApp: ElectronAppService,
    private keybinder: KeybinderService,
  ) {
    this.settings$ = this.store.pipe(select('settings')).pipe(distinctUntilChanged());
    this.collection$ = this.store.select('collection');
    this.windowsMeta$ = this.store.select('windowsMeta');
    this.environments$ = this.store.select('environments');

    this.setDefaultLanguage();
    this.setAvailableLanguages();

    const applicationLanguage = this.getAppLanguage();
    this.translate.use(applicationLanguage).subscribe(() => {
      this.isReady = true;
    });

    // Update the app translation if the language settings is changed.
    // TODO: Consider moving this into a settings effect.
    this.settings$.pipe(
      map(settings => settings.language),
      filter(x => !!x),
      distinctUntilChanged(),
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
      .subscribe(data => {
        this.windows = data.windows;
        this.windowIds = Object.keys(data.windows);
        this.showDonationAlert = data.donation.showAlert;

        this.showImportCurlDialog = data.windowsMeta.showImportCurlDialog;
        this.showEditCollectionDialog = data.windowsMeta.showEditCollectionDialog;

        // Set the window IDs in the meta state if it does not already exist
        if (data.windowsMeta.windowIds) {
          // Filter the IDs based on the windows that are valid.
          // This fixes issues with when windows are removed.
          // Before the effect gets the remove action, the store has already been updated.
          // While this is valid, it causes the component to try to retrieve the invalid window.
          this.windowIds = data.windowsMeta.windowIds.filter(id => !!this.windows[id]);
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
      this.windowService.newWindow().subscribe();
    }
  }

  /**
   * Sets the default language
   */
  setDefaultLanguage(): void {
    // Set fallback language to default.json
    this.translate.setDefaultLang('default');
  }

  /**
   * Sets the available languages from config
   */
  setAvailableLanguages(): void {
    const availableLanguages = Object.keys(config.languages);
    this.translate.addLangs(availableLanguages);
  }

  /**
   * Checks if the specified language is available
   * @param language Language code
   */
  checkLanguageAvailability(language: string): boolean {
    return this.translate.getLangs().includes(language);
  }

  /**
   * Gets the language to use for the app
   */
  getAppLanguage(): string {
    const defaultLanguage = this.translate.getDefaultLang();
    const clientLanguage = this.translate.getBrowserLang();
    const isClientLanguageAvailable = this.checkLanguageAvailability(clientLanguage);

    return isClientLanguageAvailable && !config.isTranslateMode ? clientLanguage : defaultLanguage;
  }

  newWindow() {
    this.windowService.newWindow().pipe(first()).subscribe(({ windowId }) => {
      this.store.dispatch(new windowsMetaActions.SetActiveWindowIdAction({ windowId }));
    });
  }

  setActiveWindow(windowId) {
    this.store.dispatch(new windowsMetaActions.SetActiveWindowIdAction({ windowId }));
  }

  removeWindow(windowId) {
    this.windowService.removeWindow(windowId);
  }

  duplicateWindow(windowId) {
    this.windowService.duplicateWindow(windowId);
  }

  setWindowName(data) {
    const { windowId, windowName } = data;
    this.store.dispatch(new layoutActions.SetWindowNameAction(windowId, windowName));
  }

  repositionWindow(data) {
    const { currentPosition, newPosition } = data;
    this.store.dispatch(new windowsMetaActions.RepositionWindowAction({ currentPosition, newPosition }));
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

  setSettingsJson(settingsJson) {
    this.store.dispatch(new settingsActions.SetSettingsJsonAction({ value: settingsJson }));
  }

  setShowImportCurlDialog(value) {
    this.store.dispatch(new windowsMetaActions.ShowImportCurlDialogAction({ value }));
  }

  onThemeChange(theme) {
    this.store.dispatch(new settingsActions.SetThemeAction({ value: theme }));
  }

  onLanguageChange(language) {
    this.store.dispatch(new settingsActions.SetLanguageAction({ value: language }));
  }

  onAddQueryDepthLimitChange(depthLimit) {
    this.store.dispatch(new settingsActions.SetAddQueryDepthLimitAction({ value: depthLimit }));
  }

  onTabSizeChange(tabSize) {
    this.store.dispatch(new settingsActions.SetTabSizeAction({ value: tabSize }));
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

  toggleHeader(isOpen) {
    this.store.dispatch(new dialogsActions.ToggleHeaderDialogAction(this.activeWindowId));
  }

  toggleVariableDialog(isOpen = undefined) {
    this.store.dispatch(new dialogsActions.ToggleVariableDialogAction(this.activeWindowId));
  }

  toggleSubscriptionUrlDialog(isOpen) {
    this.store.dispatch(new dialogsActions.ToggleSubscriptionUrlDialogAction(this.activeWindowId));
  }

  toggleHistoryDialog(isOpen) {
    this.store.dispatch(new dialogsActions.ToggleHistoryDialogAction(this.activeWindowId));
  }

  toggleEnvironmentManager(show) {
    this.store.dispatch(new windowsMetaActions.ShowEnvironmentManagerAction({ value: show }));
  }

  updateBaseEnvironmentJson(opts: { value: string }) {
    this.store.dispatch(new environmentsActions.UpdateBaseEnvironmentJsonAction(opts));
  }
  updateSubEnvironmentJson(opts: { id, value }) {
    this.store.dispatch(new environmentsActions.UpdateSubEnvironmentJsonAction(opts));
  }
  updateSubEnvironmentTitle(opts: { id, value}) {
    this.store.dispatch(new environmentsActions.UpdateSubEnvironmentTitleAction(opts));
  }

  addNewSubEnvironment() {
    this.store.dispatch(new environmentsActions.AddSubEnvironmentAction({ id: uuid() }));
  }
  deleteSubEnvironment(opts) {
    this.store.dispatch(new environmentsActions.DeleteSubEnvironmentAction(opts));
    this.selectActiveEnvironment(null);
  }
  selectActiveEnvironment(id) {
    this.store.dispatch(new environmentsActions.SelectActiveSubEnvironmentAction({ id }));
  }

  toggleCollections() {
    this.showCollections = !this.showCollections;
  }

  loadCollections() {
    this.store.dispatch(new collectionActions.LoadCollectionsAction());
  }

  selectQueryFromCollection(query) {
    this.windowService.importWindowData(query);
  }

  deleteQueryFromCollection({ collectionId, query }) {
   this.store.dispatch(new collectionActions.DeleteQueryFromCollectionAction({ collectionId, query }));
  }

  deleteCollection({ collectionId }) {
    this.store.dispatch(new collectionActions.DeleteCollectionAction({ collectionId }));
  }

  toggleEditCollectionDialog({ collection }) {
    this.store.dispatch(new collectionActions.SetActiveCollectionAction({ collection }));
    this.store.dispatch(new windowsMetaActions.ShowEditCollectionDialogAction({ value: true }));
  }

  setShowEditCollectionDialog(value) {
    this.store.dispatch(new windowsMetaActions.ShowEditCollectionDialogAction({ value }));
  }

  updateCollection({ collection }) {
    this.store.dispatch(new collectionActions.UpdateCollectionAction({ collectionId: collection.id, collection }));
  }

  fileDropped(event) {
    const dataTransfer: DataTransfer = event.mouseEvent.dataTransfer;
    if (dataTransfer && dataTransfer.files) {
      this.windowService.handleImportedFile(dataTransfer.files);
    }
  }

  hideDonationAlert() {
    this.store.dispatch(new donationActions.HideDonationAlertAction());
  }

  openDonationPage(e) {
    this.donationService.donated();
    this.externalLink(e, config.donation.url);
    this.hideDonationAlert();
  }

  externalLink(e, url) {
    e.preventDefault();

    // If electron app
    if (window['process'] && window['process'].versions['electron']) {
      const electron = window['require']('electron');
      electron.shell.openExternal(url);
    } else {
      const win = window.open(url, '_blank');
      if (win) {
        win.focus();
      }
    }
  }
}
