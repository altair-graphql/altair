import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { AltairPanel } from 'altair-graphql-core/build/plugin/panel';
import {
  EnvironmentsState,
  EnvironmentState,
} from 'altair-graphql-core/build/types/state/environments.interfaces';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import { externalLink } from '../../utils';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HeaderComponent {
  readonly windows = input<WindowState>({});
  readonly windowIds = input<string[]>([]);
  readonly closedWindows = input<PerWindowState[]>([]);
  readonly activeWindowId = input('');
  readonly isElectron = input(false);
  readonly headerPanels = input<AltairPanel[]>([]);
  readonly collections = input<IQueryCollection[]>([]);
  readonly activeEnvironment = input<EnvironmentState>();
  readonly environments = input<EnvironmentsState>();
  readonly settings = input<SettingsState>();
  readonly activeWindowChange = output<string>();
  readonly newWindowChange = output();
  readonly removeWindowChange = output<string>();
  readonly duplicateWindowChange = output<string>();
  readonly windowNameChange = output<{
    windowId: string;
    windowName: string;
}>();
  readonly reorderWindowsChange = output<string[]>();
  readonly reopenClosedWindowChange = output();
  readonly togglePanelActiveChange = output<AltairPanel>();
  readonly selectActiveEnvironmentChange = output<string | undefined>();
  readonly toggleEnvironmentManagerChange = output<boolean>();
  readonly showSettingsDialogChange = output();
  readonly importWindowChange = output();
  readonly showImportCurlDialogChange = output<boolean>();
  readonly exportBackupDataChange = output();
  readonly importBackupDataChange = output();

  openLink(e: Event, url: string) {
    externalLink(url, e);
  }

  trackById<T extends { id?: string }>(index: number, item: T) {
    return item.id;
  }
}
