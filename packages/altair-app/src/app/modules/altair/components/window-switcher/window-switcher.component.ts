import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, HostBinding, input, inject, output } from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';

import { debug } from '../../utils/logger';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';

@Component({
  selector: 'app-window-switcher',
  templateUrl: './window-switcher.component.html',
  styleUrls: ['./window-switcher.component.scss'],
  standalone: false,
})
export class WindowSwitcherComponent {
  private altairConfig = inject(AltairConfig);
  private nzContextMenuService = inject(NzContextMenuService);

  readonly windows = input<WindowState>({});
  readonly windowIds = input<string[]>([]);
  readonly closedWindows = input<PerWindowState[]>([]);
  readonly collections = input<IQueryCollection[]>([]);
  readonly activeWindowId = input('');
  readonly isElectron = input(false);
  readonly enableScrollbar = input(false);
  readonly activeWindowChange = output();
  readonly newWindowChange = output();
  readonly removeWindowChange = output();
  readonly duplicateWindowChange = output();
  readonly windowNameChange = output();
  readonly reopenClosedWindowChange = output();
  readonly reorderWindowsChange = output<string[]>();

  @HostBinding('class.window-switcher__no-scrollbar') get noScrollbar() {
    return !this.enableScrollbar();
  }

  windowIdEditing = '';
  maxWindowCount = this.altairConfig.max_windows;

  onDropEnd(event: CdkDragDrop<any, any, any>) {
    this.moveWindow(event.previousIndex || 0, event.currentIndex || 0);
  }

  onClickWindow(windowId: string) {
    this.activeWindowChange.emit(windowId);
  }

  editWindowNameInput(windowId: string) {
    this.windowIdEditing = windowId;
  }

  saveWindowName(windowId: string, windowName: string) {
    if (this.windowIdEditing) {
      this.windowNameChange.emit({ windowId, windowName });
      this.windowIdEditing = '';
    }
  }

  moveWindow(currentPosition: number, newPosition: number) {
    const windowIds = [...this.windowIds()];
    moveItemInArray(windowIds, currentPosition, newPosition);
    this.reorderWindowsChange.emit(windowIds);
  }

  closeWindow(windowId: string) {
    return this.removeWindowChange.emit(windowId);
  }

  closeWindowsToTheRight(curIndex: number) {
    const lowerBound = curIndex + 1;
    if (lowerBound >= this.windowIds().length) {
      return;
    }
    return this.windowIds()
      .filter((wid, i) => i > curIndex)
      .map((_) => this.closeWindow(_));
  }

  closeOtherWindows(windowId: string) {
    return this.windowIds()
      .filter((wid) => wid !== windowId)
      .map((_) => this.closeWindow(_));
  }

  duplicateWindow(windowId: string) {
    this.duplicateWindowChange.emit(windowId);
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
}
