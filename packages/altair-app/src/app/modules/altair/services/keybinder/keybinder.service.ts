import { Injectable, NgZone, inject } from '@angular/core';
import hotkeys from 'hotkeys-js';
import { Store } from '@ngrx/store';
import { WindowService } from '../window.service';

import * as windowsActions from '../../store/windows/windows.action';
import * as dialogsActions from '../../store/dialogs/dialogs.action';
import * as queryActions from '../../store/query/query.action';
import * as variablesActions from '../../store/variables/variables.action';
import * as collectionActions from '../../store/collection/collection.action';
import * as docsActions from '../../store/docs/docs.action';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { take } from 'rxjs/operators';
import { catchUselessObservableError } from '../../utils/errors';
import { isElectronApp } from '../../utils';
import { VARIABLE_EDITOR_COMPONENT_ELEMENT_NAME } from '../../components/variables-editor/variables-editor.component';

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
  private store = inject<Store<RootState>>(Store);
  private windowService = inject(WindowService);
  private zone = inject(NgZone);

  windowIds: string[] = [];
  activeWindowId = '';

  private shortcuts: KeyboardShortcut[] = [];

  constructor() {
    this.store.subscribe((data) => {
      this.windowIds = Object.keys(data.windows);
      this.activeWindowId = data.windowsMeta.activeWindowId;
    });
  }

  connect() {
    this.bindShortcut(
      ['Ctrl+Shift+V'],
      () =>
        this.store.dispatch(
          new dialogsActions.ToggleVariableDialogAction(this.activeWindowId)
        ),
      'Toggle Variable Pane',
      true
    );

    this.bindShortcut(
      ['Ctrl+Shift+H'],
      () =>
        this.store.dispatch(
          new dialogsActions.ToggleHeaderDialogAction(this.activeWindowId)
        ),
      'Toggle Header Pane',
      true
    );

    this.bindShortcut(
      ['Ctrl+Shift+R'],
      () =>
        this.store.dispatch(
          new queryActions.SendIntrospectionQueryRequestAction(this.activeWindowId)
        ),
      'Reload Docs'
    );

    this.bindShortcut(
      ['Ctrl+Shift+D'],
      () =>
        this.store.dispatch(
          new docsActions.ToggleDocsViewAction(this.activeWindowId)
        ),
      'Toggle Docs'
    );

    this.bindShortcut(
      ['Ctrl+Shift+P'],
      () => {
        if (
          document.activeElement?.closest(VARIABLE_EDITOR_COMPONENT_ELEMENT_NAME)
        ) {
          this.store.dispatch(
            new variablesActions.PrettifyVariablesAction(this.activeWindowId)
          );
        } else {
          this.store.dispatch(
            new queryActions.PrettifyQueryAction(this.activeWindowId)
          );
        }
      },
      'Prettify Query'
    );

    this.bindShortcut(
      ['Command+Enter', 'Ctrl+Enter'],
      () =>
        this.store.dispatch(
          new queryActions.SendQueryRequestAction(this.activeWindowId)
        ),
      'Send Request'
    );

    this.bindShortcut(
      ['Command+S'],
      () =>
        this.store.dispatch(
          new collectionActions.UpdateQueryInCollectionAction({
            windowId: this.activeWindowId,
          })
        ),
      'Save Request'
    );

    this.bindShortcut(
      ['Ctrl+T'],
      () =>
        this.windowService
          .newWindow()
          .pipe(take(1), catchUselessObservableError)
          .subscribe(),
      'Create new window'
    );

    this.bindShortcut(
      ['Ctrl+Shift+T'],
      () => this.store.dispatch(new windowsActions.ReopenClosedWindowAction()),
      'Reopen closed window'
    );

    this.bindShortcut(
      ['Ctrl+W'],
      () => {
        if (this.windowIds.length > 1) {
          this.windowService
            .removeWindow(this.activeWindowId)
            .pipe(catchUselessObservableError)
            .subscribe();
        }
      },
      'Close window'
    );
  }

  bindShortcut(
    keys: string[],
    callback: (...args: unknown[]) => unknown,
    description: string,
    allowInPopups = false
  ) {
    this.shortcuts.push({
      keys,
      description,
    });

    return hotkeys(keys.map((key) => key.toLowerCase()).join(','), () => {
      if (!allowInPopups && this.isInPopup()) {
        return;
      }
      this.zone.run(callback);
      return false;
    });
  }

  getShortcuts() {
    const categories: KeyboardShortcutCategory[] = [
      {
        title: 'General',
        shortcuts: this.shortcuts,
      },
      {
        title: 'Editor',
        shortcuts: [
          {
            keys: ['Ctrl+D'],
            description: 'Jump to docs',
          },
          {
            keys: ['Ctrl+F', 'Alt+F'],
            description: 'Search in context',
          },
          {
            keys: ['Ctrl+/', 'Command+/'],
            description: 'Toggle comment',
          },
          {
            keys: ['Ctrl+Shift+Enter'],
            description: 'Fill all fields',
          },
        ],
      },
    ];
    if (isElectronApp()) {
      categories.push({
        title: 'Electron Shortcuts',
        shortcuts: [],
      });
    }

    return categories;
  }

  private isInPopup() {
    const activeElement = document.activeElement as HTMLElement | null;
    return !!activeElement?.closest('nz-modal-container');
  }
}
