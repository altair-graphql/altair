import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import * as fromHeader from '../../reducers/headers/headers';
import * as fromVariable from '../../reducers/variables/variables';

import * as queryActions from '../../actions/query/query';
import * as headerActions from '../../actions/headers/headers';
import * as variableActions from '../../actions/variables/variables';
import * as dialogsActions from '../../actions/dialogs/dialogs';
import * as layoutActions from '../../actions/layout/layout';
import * as docsActions from '../../actions/docs/docs';
import * as windowsActions from '../../actions/windows/windows';

import { QueryService } from '../../services/query.service';
import { GqlService } from '../../services/gql.service';
import { WindowService } from '../../services/window.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  windowIds$: Observable<any>;
  windowIds = [];
  windowsArr = [];
  activeWindowId = '';

  constructor(
    private windowService: WindowService,
    private store: Store<any>
  ) {
    this.windowIds$ = this.store.select('windows').map(windows => {
      return Object.keys(windows);
    });
    this.store
      .subscribe(data => {
        console.log(data.windows);
        this.windowIds = Object.keys(data.windows);
        this.windowsArr = this.windowIds.map(id => data.windows[id]);

        // If the active window has not been set, default it
        if (!this.activeWindowId || !data.windows[this.activeWindowId]) {
          this.activeWindowId = this.windowIds[0];
        }
      });

    this.windowService.loadWindows();
  }

  newWindow() {
    this.windowService.newWindow();
  }

  setActiveWindow(windowId) {
    this.activeWindowId = windowId;
  }

  removeWindow(windowId) {
    this.windowService.removeWindow(windowId);
  }

  setWindowName(data) {
    const { windowId, windowName } = data;
    this.store.dispatch(new layoutActions.SetWindowNameAction(windowId, windowName));
  }

  /**
   * Transform an object into an array
   * @param obj
   */
  objToArr(obj: any) {
    const arr = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(obj[key]);
      }
    }
    return arr;
  }
}
