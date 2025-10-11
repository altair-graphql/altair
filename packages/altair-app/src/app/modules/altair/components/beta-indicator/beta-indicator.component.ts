import { Component, input, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import * as settingsActions from '../../store/settings/settings.action';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-beta-indicator',
  templateUrl: './beta-indicator.component.html',
  styles: [],
  standalone: false,
})
export class BetaIndicatorComponent {
  private store = inject<Store<RootState>>(Store);

  readonly title = input('');
  readonly description = input('');

  // the matching feature name in the settings namespaced with "beta.disable.". For example if you have "beta.disable.newEditor" in settings, this should be "newEditor"
  readonly featureKey = input.required<string>();

  value$: Observable<boolean>;

  constructor() {
    this.value$ = this.store.select(
      (state) => !state.settings[this.getSettingKey()]
    );
  }

  getSettingKey() {
    return ('beta.disable.' + this.featureKey()) as keyof SettingsState;
  }

  setValue(val: boolean) {
    this.store.dispatch(
      new settingsActions.UpdateSettingsAction({
        [this.getSettingKey()]: !val, // inverting since value is inverted ("beta.disable.")
      })
    );
  }
}
