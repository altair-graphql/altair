import { Injectable } from '@angular/core';
import { bind } from 'mousetrap';
import { Store } from '@ngrx/store';
import { WindowService } from '../window.service';

import * as fromRoot from '../../reducers';

import * as dialogsActions from '../../actions/dialogs/dialogs';

@Injectable()
export class KeybinderService {

  windowIds;
  activeWindowId = '';

  constructor(
    private store: Store<fromRoot.State>,
    private windowService: WindowService,
  ) {
    this.store.subscribe(data => {
      this.windowIds = Object.keys(data.windows);
      this.activeWindowId = data.windowsMeta.activeWindowId;
    })
  }

  connect() {
    bind('ctrl+shift+v', () =>
      this.store.dispatch(new dialogsActions.ToggleVariableDialogAction(this.activeWindowId)));

    bind('ctrl+shift+h', () =>
      this.store.dispatch(new dialogsActions.ToggleHeaderDialogAction(this.activeWindowId)));
  }

}
