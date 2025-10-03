import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';

import { debug } from '../../utils/logger';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { windowHasUnsavedChanges } from '../../store';

@Component({
  selector: 'app-window-switcher',
  templateUrl: './window-switcher.component.html',
  styleUrls: ['./window-switcher.component.scss'],
})
export class WindowSwitcherComponent {
  @Input() windows: WindowState = {};
  @Input() windowIds: string[] = [];
  @Input() closedWindows: PerWindowState[] = [];
  @Input() collections: IQueryCollection[] = [];
  @Input() activeWindowId = '';
  @Input() isElectron = false;
  @Input() enableScrollbar = false;
  @Output() activeWindowChange = new EventEmitter();
  @Output() newWindowChange = new EventEmitter();
  @Output() removeWindowChange = new EventEmitter();
  @Output() duplicateWindowChange = new EventEmitter();
  @Output() windowNameChange = new EventEmitter();
  @Output() repositionWindowChange = new EventEmitter();
  @Output() reopenClosedWindowChange = new EventEmitter();

  @HostBinding('class.window-switcher__no-scrollbar') get noScrollbar() {
    return !this.enableScrollbar;
  }

  windowIdEditing = '';
  maxWindowCount = this.altairConfig.max_windows;

  constructor(
    private altairConfig: AltairConfig,
    private nzContextMenuService: NzContextMenuService
  ) {}

  onDropEnd(event: CdkDragDrop<any, any, any>) {
    this.moveWindow(event.previousIndex || 0, event.currentIndex || 0);
  }

  onClickWindow(windowId: string) {
    this.activeWindowChange.next(windowId);
  }

  editWindowNameInput(windowId: string, wTitle: HTMLElement) {
    this.windowIdEditing = windowId;
    setTimeout(() => wTitle.focus(), 0);
  }

  saveWindowName(windowId: string, windowName: string) {
    if (this.windowIdEditing) {
      this.windowNameChange.next({ windowId, windowName });
      this.windowIdEditing = '';
    }
  }

  moveWindow(currentPosition: number, newPosition: number) {
    this.repositionWindowChange.next({ currentPosition, newPosition });
  }

  closeWindow(windowId: string) {
    return this.removeWindowChange.next(windowId);
  }

  closeWindowsToTheRight(curIndex: number) {
    const lowerBound = curIndex + 1;
    if (lowerBound >= this.windowIds.length) {
      return;
    }
    return this.windowIds
      .filter((wid, i) => i > curIndex)
      .map((_) => this.closeWindow(_));
  }

  closeOtherWindows(windowId: string) {
    return this.windowIds
      .filter((wid) => wid !== windowId)
      .map((_) => this.closeWindow(_));
  }

  duplicateWindow(windowId: string) {
    this.duplicateWindowChange.next(windowId);
  }

  reopenClosedTab() {
    this.reopenClosedWindowChange.emit();
  }

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event, menu);
  }

  closeMenu(): void {
    this.nzContextMenuService.close();
  }

  log(str: string) {
    debug.log(str);
  }

  isWindowInCollection(windowId: string) {
    const windowIdInCollection =
      this.windows[windowId]?.layout?.windowIdInCollection;
    const collectionId = this.windows[windowId]?.layout?.collectionId;
    if (!windowIdInCollection || !collectionId) {
      return false;
    }

    const collection = this.collections.find(
      (collection) => collection.id === collectionId
    );

    if (!collection) {
      return false;
    }

    return !!collection.queries.find((query) => query.id === windowIdInCollection);
  }

  windowHasUnsavedChanges(windowId: string) {
    const window = this.windows[windowId];
    if (!window) {
      return false;
    }
    if (!this.isWindowInCollection(windowId)) {
      return false;
    }
    return windowHasUnsavedChanges(window, this.collections);
  }

  isWindowLoading(windowId: string) {
    const window = this.windows[windowId];
    if (!window) {
      return false;
    }
    return window.layout?.isLoading ?? false;
  }
}
