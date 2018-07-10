import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';

import * as fromRoot from '../../reducers';
import * as fromHeader from '../../reducers/headers/headers';
import * as fromVariable from '../../reducers/variables/variables';
import * as fromSettings from '../../reducers/settings/settings';

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

import { environment } from '../../../environments/environment';

import { QueryService, GqlService, WindowService, DonationService, ElectronAppService } from '../../services';

import config from '../../config';
import isElectron from '../../utils/is_electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  windowIds$: Observable<any[]>;
  settings$: Observable<fromSettings.State>;

  windowIds = [];
  windows = {};
  activeWindowId = '';
  isElectron = isElectron;
  isReady = false; // determines if the app is fully loaded. Assets, translations, etc.
  showDonationAlert = false;

  showImportCurlDialog = false;

  appVersion = environment.version;

  constructor(
    private windowService: WindowService,
    private store: Store<fromRoot.State>,
    private translate: TranslateService,
    private donationService: DonationService,
    private electronApp: ElectronAppService,
  ) {
    this.settings$ = this.store.select('settings').distinctUntilChanged();

    this.setDefaultLanguage();
    this.setAvailableLanguages();

    const applicationLanguage = this.getAppLanguage();
    this.translate.use(applicationLanguage).subscribe(() => {
      this.isReady = true;
    });

    // Update the app translation if the language settings is changed.
    // TODO: Consider moving this into a settings effect.
    this.settings$
      .map(settings => settings.language)
      .filter(x => !!x)
      .distinctUntilChanged()
      .subscribe(language => {
        this.translate.use(language);
      });

    this.electronApp.connect();

    this.windowIds$ = this.store.select('windows').map(windows => {
      return Object.keys(windows);
    });
    this.store
      .subscribe(data => {
        this.windows = data.windows;
        this.windowIds = Object.keys(data.windows);
        this.showDonationAlert = data.donation.showAlert;

        this.showImportCurlDialog = data.windowsMeta.showImportCurlDialog;

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
        console.log(data.windows, this.windowIds);

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
   * Sets the default language from config
   */
  setDefaultLanguage(): void {
    const defaultLanguage = config.default_language;
    this.translate.setDefaultLang(defaultLanguage);
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
    this.windowService.newWindow().first().subscribe();
  }

  setActiveWindow(windowId) {
    this.store.dispatch(new windowsMetaActions.SetActiveWindowIdAction({ windowId }));
  }

  removeWindow(windowId) {
    this.windowService.removeWindow(windowId);
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
    this.store.dispatch(new settingsActions.ShowSettingsAction());
  }

  hideSettingsDialog() {
    this.store.dispatch(new settingsActions.HideSettingsAction());
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
      win.focus();
    }
  }
}
