import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';

import { ContextMenuComponent } from 'ngx-contextmenu';

import { debug } from '../../utils/logger';

@Component({
  selector: 'app-window-switcher',
  templateUrl: './window-switcher.component.html',
  styleUrls: ['./window-switcher.component.scss']
})
export class WindowSwitcherComponent implements OnInit {

  @Input() windows = {};
  @Input() windowIds = [];
  @Input() closedWindows = [];
  @Input() activeWindowId = '';
  @Input() isElectron = false;
  @Output() activeWindowChange = new EventEmitter();
  @Output() newWindowChange = new EventEmitter();
  @Output() removeWindowChange = new EventEmitter();
  @Output() duplicateWindowChange = new EventEmitter();
  @Output() windowNameChange = new EventEmitter();
  @Output() repositionWindowChange = new EventEmitter();
  @Output() reopenClosedWindowChange = new EventEmitter();

  @ViewChild(ContextMenuComponent, { static: true }) public windowTabMenu: ContextMenuComponent;

  windowTabMenuData = [
    { name: 'Edit' }
  ];

  windowIdEditing = '';
  maxWindowCount = this.altairConfig.max_windows;

  sortableOptions = {};

  constructor(
    private altairConfig: AltairConfig,
  ) {}

  ngOnInit() {
    this.sortableOptions = {
      onUpdate: (event: any) => {
        this.moveWindow(event.oldIndex, event.newIndex);
      }
    };
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
    this.repositionWindowChange.next(({ currentPosition, newPosition }));
  }

  closeWindow(windowId: string) {
    return this.removeWindowChange.next(windowId);
  }

  closeWindowsToTheRight(curIndex: number) {
    const lowerBound = curIndex + 1;
    if (lowerBound >= this.windowIds.length) {
      return;
    }
    return this.windowIds.filter((wid, i) => i > curIndex).map(_ => this.closeWindow(_));
  }

  closeOtherWindows(windowId: string) {
    return this.windowIds.filter(wid => wid !== windowId).map(_ => this.closeWindow(_));
  }

  duplicateWindow(windowId: string) {
    this.duplicateWindowChange.next(windowId);
  }

  reopenClosedTab() {
    this.reopenClosedWindowChange.emit();
  }

  log(str: any) {
    debug.log(str);
  }

}
