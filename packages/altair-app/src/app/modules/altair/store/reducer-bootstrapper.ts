import { Injectable } from '@angular/core';
import { AltairConfig } from '../config';
import { getAppStateFromStorage } from './async-storage-sync';
import { RootState } from './state.interfaces';

@Injectable()
export class ReducerBootstrapper {
  initialState: RootState | undefined;

  constructor(
    private altairConfig: AltairConfig,
  ) {}

  async bootstrap() {
    if (this.altairConfig.initialData.preserveState) {
      this.initialState = await getAppStateFromStorage({ updateFromLocalStorage: true });
    }
  }
}
