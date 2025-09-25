import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootState } from '../../state';
import { NotifyService } from '../notify/notify.service';
import { StorageService } from '../storage/storage.service';
import { tauriAPI, isTauriApp, HeaderState, ConnectOptions } from '@altairgraphql/tauri-interop';
import * as windowsMetaActions from '../../state/windows-meta/windows-meta.action';
import { take } from 'rxjs/operators';
import { debug } from '../../utils/logger';

@Injectable({
  providedIn: 'root',
})
export class TauriAppService {
  windowIds: string[] = [];
  activeWindowId = '';

  private api = tauriAPI;

  private lastBackupTs = Date.now();

  constructor(
    private store: Store<RootState>,
    private notifyService: NotifyService,
    private storageService: StorageService,
    private zone: NgZone
  ) {
    this.initAutobackup();
  }

  connect({
    importFileContent,
    createNewWindow,
    closeCurrentWindow,
    openUrl,
  }: ConnectOptions) {
    if (!isTauriApp() || !this.api) {
      return;
    }

    // Set up event listeners
    this.api.events.onFileOpened((content: string) => {
      this.zone.run(() => {
        importFileContent(content);
      });
    });

    this.api.events.onUrlOpened((url: string) => {
      this.zone.run(() => {
        openUrl(url);
      });
    });

    this.api.events.onCreateTab(() => {
      this.zone.run(() => {
        createNewWindow();
      });
    });

    this.api.events.onCloseTab(() => {
      this.zone.run(() => {
        closeCurrentWindow();
      });
    });

    this.api.events.onNextTab(() => {
      // Handle next tab logic
    });

    this.api.events.onPreviousTab(() => {
      // Handle previous tab logic  
    });

    this.api.events.onReopenClosedTab(() => {
      // Handle reopen closed tab logic
    });

    this.api.events.onSendRequest(() => {
      // Trigger send request in current tab
    });

    this.api.events.onReloadDocs(() => {
      // Trigger reload docs
    });

    this.api.events.onShowDocs(() => {
      // Show docs panel
    });

    this.api.events.onShowSettings(() => {
      this.zone.run(() => {
        this.store.dispatch(
          new windowsMetaActions.ShowSettingsDialogAction({ value: true })
        );
      });
    });

    this.api.events.onImportAppData((data: string) => {
      this.zone.run(() => {
        importFileContent(data);
      });
    });

    this.api.events.onExportAppData(() => {
      // Handle export data
    });

    debug.log('Tauri app connected.');

    this.api.actions.rendererReady();

    this.store
      .select((state: RootState) => state.settings['alert.disableUpdateNotification'])
      .pipe(take(1))
      .subscribe((disableUpdateNotification) => {
        if (!disableUpdateNotification) {
          this.initUpdateAvailableHandler();
        }
      });
  }

  async getAuthToken() {
    if (isTauriApp() && this.api) {
      return this.api.actions.getAuthToken();
    }
    return null;
  }

  async getAutobackupData() {
    if (isTauriApp() && this.api) {
      return this.api.actions.getAutobackupData();
    }
    return null;
  }

  async importAutobackupData() {
    try {
      const data = await this.getAutobackupData();
      if (data) {
        // Process the autobackup data
        const parsedData = JSON.parse(data);
        // Handle the imported data
        debug.log('Autobackup data imported successfully');
      }
    } catch (error) {
      debug.log('Failed to import autobackup data:', error);
    }
  }

  private async initAutobackup() {
    if (!isTauriApp() || !this.api) {
      return;
    }

    // Set up periodic backup
    setInterval(() => {
      this.performAutobackup();
    }, 30000); // Every 30 seconds

    // Import existing backup on startup
    setTimeout(() => {
      this.importAutobackupData();
    }, 1000);
  }

  private async performAutobackup() {
    try {
      const now = Date.now();
      if (now - this.lastBackupTs < 30000) {
        // Don't backup too frequently
        return;
      }

      // Get current state to backup
      this.store.pipe(take(1)).subscribe(async (state) => {
        try {
          const backupData = JSON.stringify({
            windows: state.windows,
            windowsMeta: state.windowsMeta,
            timestamp: now,
          });

          await this.api.actions.saveAutobackupData(backupData);
          this.lastBackupTs = now;
        } catch (error) {
          debug.log('Failed to save autobackup data:', error);
        }
      });
    } catch (error) {
      debug.log('Autobackup failed:', error);
    }
  }

  private initUpdateAvailableHandler() {
    if (!isTauriApp() || !this.api) {
      return;
    }

    const opts = {
      disableTimeOut: true,
      data: {
        action: () => {
          if (!isTauriApp() || !this.api) {
            return;
          }

          this.api.actions.performAppUpdate();
        },
      },
    };

    this.api.events.onUpdateAvailable(() => {
      this.notifyService.info(
        'Click here to download the latest version!',
        'Update Found!',
        opts
      );
    });
  }

  async setHeaders(headers: HeaderState) {
    if (isTauriApp() && this.api) {
      await this.api.actions.setHeaderSync(headers);
    }
  }

  isTauriApp() {
    return isTauriApp();
  }

  async restartApp() {
    if (isTauriApp() && this.api) {
      await this.api.actions.restartApp();
    }
  }

  async createNewWindow(): Promise<string> {
    if (isTauriApp() && this.api) {
      return this.api.actions.createNewWindow();
    }
    throw new Error('Not running in Tauri environment');
  }

  async closeCurrentWindow() {
    if (isTauriApp() && this.api) {
      await this.api.actions.closeCurrentWindow();
    }
  }

  async importFile(): Promise<string | null> {
    if (isTauriApp() && this.api) {
      return this.api.actions.importFile();
    }
    return null;
  }

  async exportFile(data: string, filename?: string) {
    if (isTauriApp() && this.api) {
      await this.api.actions.exportFile(data, filename);
    }
  }

  async showNotification(title: string, body: string) {
    if (isTauriApp() && this.api) {
      await this.api.actions.showNotification(title, body);
    }
  }
}