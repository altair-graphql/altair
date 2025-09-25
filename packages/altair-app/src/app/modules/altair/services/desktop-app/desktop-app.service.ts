import { Injectable } from '@angular/core';
import { ElectronAppService } from '../electron-app/electron-app.service';
import { TauriAppService } from '../tauri-app/tauri-app.service';
import { isElectronApp } from '@altairgraphql/electron-interop';
import { isTauriApp } from '@altairgraphql/tauri-interop';
import { ConnectOptions } from '@altairgraphql/electron-interop';
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';

@Injectable({
  providedIn: 'root',
})
export class DesktopAppService {
  constructor(
    private electronAppService: ElectronAppService,
    private tauriAppService: TauriAppService
  ) {}

  connect(options: ConnectOptions) {
    if (isElectronApp()) {
      this.electronAppService.connect(options);
    } else if (isTauriApp()) {
      this.tauriAppService.connect(options);
    }
  }

  async getAuthToken(): Promise<string | null> {
    if (isElectronApp()) {
      return this.electronAppService.getAuthToken();
    } else if (isTauriApp()) {
      return this.tauriAppService.getAuthToken();
    }
    return null;
  }

  async getAutobackupData(): Promise<string | null> {
    if (isElectronApp()) {
      return this.electronAppService.getAutobackupData();
    } else if (isTauriApp()) {
      return this.tauriAppService.getAutobackupData();
    }
    return null;
  }

  async importAutobackupData() {
    if (isElectronApp()) {
      return this.electronAppService.importAutobackupData();
    } else if (isTauriApp()) {
      return this.tauriAppService.importAutobackupData();
    }
  }

  setHeaders(headers: HeaderState) {
    if (isElectronApp()) {
      this.electronAppService.setHeaders(headers);
    } else if (isTauriApp()) {
      this.tauriAppService.setHeaders(headers);
    }
  }

  isDesktopApp(): boolean {
    return isElectronApp() || isTauriApp();
  }

  async restartApp() {
    if (isElectronApp()) {
      this.electronAppService.restartApp();
    } else if (isTauriApp()) {
      await this.tauriAppService.restartApp();
    }
  }

  async createNewWindow(): Promise<string | null> {
    if (isElectronApp()) {
      // ElectronAppService doesn't have this method, but we can add it
      return null;
    } else if (isTauriApp()) {
      return this.tauriAppService.createNewWindow();
    }
    return null;
  }

  async closeCurrentWindow() {
    if (isElectronApp()) {
      // ElectronAppService doesn't have this method, but we can add it
      return;
    } else if (isTauriApp()) {
      await this.tauriAppService.closeCurrentWindow();
    }
  }

  async importFile(): Promise<string | null> {
    if (isElectronApp()) {
      // Would need to implement in ElectronAppService
      return null;
    } else if (isTauriApp()) {
      return this.tauriAppService.importFile();
    }
    return null;
  }

  async exportFile(data: string, filename?: string) {
    if (isElectronApp()) {
      // Would need to implement in ElectronAppService
      return;
    } else if (isTauriApp()) {
      await this.tauriAppService.exportFile(data, filename);
    }
  }

  async showNotification(title: string, body: string) {
    if (isElectronApp()) {
      // Would need to implement in ElectronAppService
      return;
    } else if (isTauriApp()) {
      await this.tauriAppService.showNotification(title, body);
    }
  }
}