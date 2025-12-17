import { Injectable, inject } from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { ElectronAppService, NotifyService, StorageService } from '../services';
import { getAppStateFromStorage } from './async-storage-sync';
import { settingsSchema } from 'altair-graphql-core/build/types/state/settings.schema';

@Injectable({ providedIn: 'root' })
export class ReducerBootstrapper {
  private altairConfig = inject(AltairConfig);
  private storageService = inject(StorageService);
  private electronAppService = inject(ElectronAppService);
  private notifyService = inject(NotifyService);

  initialState: Partial<RootState> | undefined;

  async bootstrap() {
    if (this.altairConfig.options.preserveState) {
      // TODO: validate data; show useful error message if corrupted
      const raw = await getAppStateFromStorage({
        updateFromLocalStorage: true,
      });
      this.initialState = raw;

      // Merge electron setting state with initial setting state if available
      const settingsFromFile = await this.electronAppService.getSettingsFromFile();
      if (settingsFromFile) {
        this.initialState = {
          ...this.initialState,
          settings: settingsSchema.parse({
            ...this.initialState?.settings,
            ...settingsFromFile,
          }),
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
