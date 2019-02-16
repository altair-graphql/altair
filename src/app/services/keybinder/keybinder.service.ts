import { Injectable } from '@angular/core';
import { bind, bindGlobal } from 'mousetrap';
import 'mousetrap-global-bind';
import { Store } from '@ngrx/store';
import { WindowService } from '../window.service';

import * as fromRoot from '../../reducers';

import * as dialogsActions from '../../actions/dialogs/dialogs';
import * as queryActions from '../../actions/query/query';

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
    bindGlobal('ctrl+shift+v', () =>
      this.store.dispatch(new dialogsActions.ToggleVariableDialogAction(this.activeWindowId)));

    bindGlobal('ctrl+shift+h', () =>
      this.store.dispatch(new dialogsActions.ToggleHeaderDialogAction(this.activeWindowId)));

    bindGlobal(['command+enter', 'ctrl+enter'], () =>
      this.store.dispatch(new queryActions.SendQueryRequestAction(this.activeWindowId)));
  }

}
