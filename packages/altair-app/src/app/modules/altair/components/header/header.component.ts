import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AltairPanel } from 'altair-graphql-core/build/plugin/panel';
import {
  EnvironmentsState,
  EnvironmentState,
} from 'altair-graphql-core/build/types/state/environments.interfaces';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import { externalLink } from '../../utils';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [],
})
export class HeaderComponent {
  @Input() windows: WindowState = {};
  @Input() windowIds: string[] = [];
  @Input() closedWindows: PerWindowState[] = [];
  @Input() activeWindowId = '';
  @Input() isElectron = false;
  @Input() headerPanels: AltairPanel[] = [];
  @Input() activeEnvironment?: EnvironmentState;
  @Input() environments?: EnvironmentsState;
  @Input() settings?: SettingsState;
  @Output() activeWindowChange = new EventEmitter<string>();
  @Output() newWindowChange = new EventEmitter();
  @Output() removeWindowChange = new EventEmitter<string>();
  @Output() duplicateWindowChange = new EventEmitter<string>();
  @Output() windowNameChange = new EventEmitter<{
    windowId: string;
    windowName: string;
  }>();
  @Output() repositionWindowChange = new EventEmitter<{
    currentPosition: number;
    newPosition: number;
  }>();
  @Output() reopenClosedWindowChange = new EventEmitter();
  @Output() togglePanelActiveChange = new EventEmitter<AltairPanel>();
  @Output() selectActiveEnvironmentChange = new EventEmitter<
    string | undefined
  >();
  @Output() toggleEnvironmentManagerChange = new EventEmitter<boolean>();
  @Output() showSettingsDialogChange = new EventEmitter();
  @Output() importWindowChange = new EventEmitter();
  @Output() showImportCurlDialogChange = new EventEmitter<boolean>();
  @Output() exportBackupDataChange = new EventEmitter();
  @Output() importBackupDataChange = new EventEmitter();

  constructor() {}

  openLink(e: Event, url: string) {
    externalLink(e, url);
  }

  trackById<T extends { id?: string }>(index: number, item: T) {
    return item.id;
  }
}
