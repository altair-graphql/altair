import { Injectable, NgZone } from '@angular/core';
import * as mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { Store } from '@ngrx/store';
import { WindowService } from '../window.service';

import * as fromRoot from '../../reducers';

import * as dialogsActions from '../../actions/dialogs/dialogs';
import * as queryActions from '../../actions/query/query';
import * as docsActions from '../../actions/docs/docs';
import { ElectronAppService } from '../electron-app/electron-app.service';


interface KeyboardShortcut {
  keys: string[];
  description: string;
}

export const SEND_REQUEST_KEYBINDS = ['Command+Enter', 'Ctrl+Enter']

@Injectable()
export class KeybinderService {

  windowIds;
  activeWindowId = '';

  private shortcuts: KeyboardShortcut[] = [];

  constructor(
    private store: Store<fromRoot.State>,
    private windowService: WindowService,
    private electronService: ElectronAppService,
    private zone: NgZone,
  ) {
    this.store.subscribe(data => {
      this.windowIds = Object.keys(data.windows);
      this.activeWindowId = data.windowsMeta.activeWindowId;
    })
  }

  connect() {
    this.bindShortcut(
      ['Ctrl+Shift+V'],
      () => this.store.dispatch(new dialogsActions.ToggleVariableDialogAction(this.activeWindowId)),
      'Toggle Variable Pane'
    );

    this.bindShortcut(
      ['Ctrl+Shift+H'],
      () => this.store.dispatch(new dialogsActions.ToggleHeaderDialogAction(this.activeWindowId)),
      'Toggle Header Pane'
    );

    this.bindShortcut(
      ['Ctrl+Shift+R'],
      () => this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(this.activeWindowId)),
      'Reload Docs'
    );

    this.bindShortcut(
      ['Ctrl+Shift+D'],
      () => this.store.dispatch(new docsActions.ToggleDocsViewAction(this.activeWindowId)),
      'Toggle Docs'
    );

    this.bindShortcut(
      ['Ctrl+Shift+P'],
      () => this.store.dispatch(new queryActions.PrettifyQueryAction(this.activeWindowId)),
      'Prettify Query'
    );

    this.bindShortcut(
      SEND_REQUEST_KEYBINDS,
      () => this.store.dispatch(new queryActions.SendQueryRequestAction(this.activeWindowId)),
      'Send Request'
    );
  }

  bindShortcut(keys: string[], callback, description?: string) {
    this.shortcuts.push({
      keys,
      description
    });

    return mousetrap.bindGlobal(keys.map(key => key.toLowerCase()), () => this.zone.run(callback));
  }

  getShortcuts() {
    const categories: { title, shortcuts: KeyboardShortcut[] }[] = [
      {
        title: 'General',
        shortcuts: this.shortcuts
      },
      {
        title: 'Editor',
        shortcuts: [
          {
            keys: ['Ctrl+D'],
            description: 'Jump to docs'
          },
          {
            keys: ['Ctrl+F', 'Alt+F'],
            description: 'Search in context'
          },
          {
            keys: ['Ctrl+/', 'Command+/'],
            description: 'Toggle comment'
          },
          {
            keys: ['Ctrl+Shift+Enter'],
            description: 'Fill all fields'
          },
        ]
      },
    ];
    if (this.electronService.isElectronApp()) {
      categories.push({
        title: 'Electron Shortcuts',
        shortcuts: [
        ]
      });
    }

    return categories;
  }

}
