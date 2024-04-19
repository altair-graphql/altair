import { Injectable } from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { ElectronAppService, NotifyService, StorageService } from '../services';
import { getAppStateFromStorage } from './async-storage-sync';

@Injectable()
export class ReducerBootstrapper {
  initialState: Partial<RootState> | undefined;

  constructor(
    private altairConfig: AltairConfig,
    private storageService: StorageService,
    private electronAppService: ElectronAppService,
    private notifyService: NotifyService
  ) {}

  async bootstrap() {
    if (this.altairConfig.initialData.preserveState) {
      this.initialState = await getAppStateFromStorage({
        updateFromLocalStorage: true,
      });

      // Merge electron setting state with initial setting state if available
      const settingsFromFile = await this.electronAppService.getSettingsFromFile();
      if (settingsFromFile) {
        this.initialState = {
          ...this.initialState,
          settings: {
            ...this.initialState?.settings,
            ...settingsFromFile,
          },
        };
      }

      // try to import backup if no initial state
      if (!this.initialState) {
        if (await this.electronAppService.importAutobackupData()) {
          this.notifyService.warning(
            'Your application state has been automatically recovered.',
            'Recovered data'
          );
        }
      }
      await this.cleanSelectedFilesStorage();
    }
  }

  async cleanSelectedFilesStorage() {
    if (this.initialState) {
      // remove all selectedFiles where windowId not in windowIds
      await this.storageService.selectedFiles
        .where('windowId')
        .noneOf(this.initialState.windowsMeta?.windowIds || [])
        .delete();
    }
  }
}
