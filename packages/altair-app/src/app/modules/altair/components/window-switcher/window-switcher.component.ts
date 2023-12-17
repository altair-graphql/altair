import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  HostBinding,
} from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';

import { ContextMenuComponent } from 'ngx-contextmenu';

import { debug } from '../../utils/logger';

@Component({
  selector: 'app-window-switcher',
  templateUrl: './window-switcher.component.html',
  styleUrls: ['./window-switcher.component.scss'],
})
export class WindowSwitcherComponent {
  @Input() windows: WindowState = {};
  @Input() windowIds: string[] = [];
  @Input() closedWindows: PerWindowState[] = [];
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

  @ViewChild(ContextMenuComponent, { static: true })
  public windowTabMenu?: ContextMenuComponent;

  windowTabMenuData = [{ name: 'Edit' }];

  windowIdEditing = '';
  maxWindowCount = this.altairConfig.max_windows;

  constructor(private altairConfig: AltairConfig) {}

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

  log(str: string) {
    debug.log(str);
  }
}
