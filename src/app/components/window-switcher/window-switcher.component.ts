import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';

import { ContextMenuComponent } from 'ngx-contextmenu';

import config from '../../config';
import { debug } from 'app/utils/logger';

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

  windowNameEditing = null;
  maxWindowCount = config.max_windows;

  sortableOptions = {};

  constructor() {}

  ngOnInit() {
    this.sortableOptions = {
      onUpdate: (event: any) => {
        this.moveWindow(event.oldIndex, event.newIndex);
      }
    };
  }

  editWindowNameInput(windowId, wTitle) {
    this.windowNameEditing = windowId;
    wTitle.setAttribute('contenteditable', true);
    wTitle.focus();
  }

  saveWindowName(windowId, windowName) {
    this.windowNameChange.next({ windowId, windowName });
    this.windowNameEditing = null;
  }

  moveWindow(currentPosition, newPosition) {
    this.repositionWindowChange.next(({ currentPosition, newPosition }));
  }

  closeWindow(windowId) {
    return this.removeWindowChange.next(windowId);
  }

  closeWindowsToTheRight(curIndex: number) {
    const lowerBound = curIndex + 1;
    if (lowerBound >= this.windowIds.length) {
      return;
    }
    return this.windowIds.filter((wid, i) => i > curIndex).map(_ => this.closeWindow(_));
  }

  closeOtherWindows(windowId) {
    return this.windowIds.filter(wid => wid !== windowId).map(_ => this.closeWindow(_));
  }

  duplicateWindow(windowId) {
    this.duplicateWindowChange.next(windowId);
  }

  reopenClosedTab() {
    this.reopenClosedWindowChange.emit();
  }

  log(str) {
    debug.log(str);
  }

}
