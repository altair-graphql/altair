import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import config from '../../config';

@Component({
  selector: 'app-window-switcher',
  templateUrl: './window-switcher.component.html',
  styleUrls: ['./window-switcher.component.scss']
})
export class WindowSwitcherComponent implements OnInit {

  @Input() windows = {};
  @Input() windowIds = [];
  @Input() activeWindowId = '';
  @Input() isElectron = false;
  @Output() activeWindowChange = new EventEmitter();
  @Output() newWindowChange = new EventEmitter();
  @Output() removeWindowChange = new EventEmitter();
  @Output() windowNameChange = new EventEmitter();
  @Output() repositionWindowChange = new EventEmitter();

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

}
