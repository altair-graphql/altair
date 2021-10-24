import { Injectable } from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { StorageService } from '../services';
import { getAppStateFromStorage } from './async-storage-sync';

@Injectable()
export class ReducerBootstrapper {
  initialState: RootState | undefined;

  constructor(
    private altairConfig: AltairConfig,
    private storageService: StorageService,
  ) {}

  async bootstrap() {
    if (this.altairConfig.initialData.preserveState) {
      this.initialState = await getAppStateFromStorage({ updateFromLocalStorage: true });
      await this.cleanSelectedFilesStorage();
    }
  }

  async cleanSelectedFilesStorage() {
    if (this.initialState) {
      // remove all selectedFiles where windowId not in windowIds
      await this.storageService.selectedFiles
        .where('windowId')
        .noneOf(this.initialState.windowsMeta.windowIds)
        .delete();
    }
  }
}
