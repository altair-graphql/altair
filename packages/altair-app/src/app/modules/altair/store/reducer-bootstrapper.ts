import { Injectable } from '@angular/core';
import { TODO } from '../interfaces/shared';
import { getAppStateFromStorage } from './async-storage-sync';

@Injectable()
export class ReducerBootstrapper {
  initialState: TODO;

  async bootstrap() {
    this.initialState = await getAppStateFromStorage({ updateFromLocalStorage: true });
  }
}
