import { CollectionState } from './collection.interfaces';
import { DonationState } from './donation.interfaces';
import { EnvironmentsState } from './environments.interfaces';
import { LocalState } from './local.interfaces';
import { SettingsState } from './settings.interfaces';
import { WindowState } from './window.interfaces';
import { WindowsMetaState } from './windows-meta.interfaces';

export interface RootState {
  windows: WindowState;
  windowsMeta: WindowsMetaState;
  settings: SettingsState;
  donation: DonationState;
  collection: CollectionState;
  environments: EnvironmentsState;
  local: LocalState;
}
