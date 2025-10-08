import {
  Component,
  Output,
  EventEmitter,
  input,
  model,
  effect,
} from '@angular/core';
import { SchemaFormProperty } from 'app/modules/altair/utils/settings_addons';
import { ThemeRegistryService } from '../../../services';

@Component({
  selector: 'app-schema-form-item-input',
  templateUrl: './schema-form-item-input.component.html',
  styles: [],
  standalone: false,
})
export class SchemaFormItemInputComponent {
  readonly item = input<SchemaFormProperty>();
  readonly data = model<string>();

  @Output() dataChange = new EventEmitter();

  constructor(private themeRegistry: ThemeRegistryService) {
    effect(() => {
      this.dataChange.emit(this.data());
    });
  }

  getAutocompleteOptions(item: SchemaFormProperty) {
    switch (item?.key) {
      case 'theme':
      case 'theme.dark':
        // TODO: Move system to theme registry
        return ['system', ...this.themeRegistry.getAllThemes()];
      default:
        return [];
    }
  }
}
