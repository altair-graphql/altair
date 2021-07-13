import { Injectable, NgZone } from '@angular/core';
import * as mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { Store } from '@ngrx/store';
import { WindowService } from '../window.service';

import * as fromRoot from '../../store';

import * as dialogsActions from '../../store/dialogs/dialogs.action';
import * as queryActions from '../../store/query/query.action';
import * as docsActions from '../../store/docs/docs.action';
import { ElectronAppService } from '../electron-app/electron-app.service';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

export interface KeyboardShortcutCategory {
  title: string;
  shortcuts: KeyboardShortcut[];
}

export interface KeyboardShortcut {
  keys: string[];
  description: string;
}

@Injectable()
export class KeybinderService {

  windowIds: string[];
  activeWindowId = '';

  private shortcuts: KeyboardShortcut[] = [];

  constructor(
    private store: Store<RootState>,
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
      ['Command+Enter', 'Ctrl+Enter'],
      () => this.store.dispatch(new queryActions.SendQueryRequestAction(this.activeWindowId)),
      'Send Request'
    );
  }

  bindShortcut(keys: string[], callback: (...args: any[]) => any, description = '') {
    this.shortcuts.push({
      keys,
      description
    });

    return mousetrap.bindGlobal(keys.map(key => key.toLowerCase()), () => this.zone.run(callback));
  }

  getShortcuts() {
    const categories: KeyboardShortcutCategory[] = [
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
