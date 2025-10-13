import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  effect,
  output
} from '@angular/core';
import {
  getSchemaFormProperty,
  SchemaFormProperty,
} from 'app/modules/altair/utils/settings_addons';
import { JSONSchema6 } from 'json-schema';

@Component({
  selector: 'app-schema-form-item-list',
  templateUrl: './schema-form-item-list.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SchemaFormItemListComponent {
  readonly item = input<SchemaFormProperty>();
  readonly data = model<unknown[]>();

  readonly dataChange = output();

  constructor() {
    // effect(() => {
    //   this.dataChange.emit(this.data());
    // });
  }

  addField() {
    let data = this.data();
    if (!data || !Array.isArray(data)) {
      data = [];
    }

    data.push('');
    this.data.set(data);
  }

  removeField(index: number) {
    const data = this.data();
    if (data && Array.isArray(data)) {
      data.splice(index, 1);
      this.data.set(data);
    }
  }

  getSchemaFormPropertyForListItem(index: number, schema: JSONSchema6) {
    return getSchemaFormProperty(`${this.item()?.key}[${index}]`, schema);
  }

  setSchemaFormPropertyForListItem(index: number, value: unknown) {
    const data = this.data();
    if (data && Array.isArray(data)) {
      data[index] = value;
      this.data.set(data);
    }
  }

  isJsonSchema(p: JSONSchema6['items']): p is JSONSchema6 {
    if (!p) {
      return false;
    }
    if (Array.isArray(p)) {
      return false;
    }

    if (typeof p === 'boolean') {
      return false;
    }

    return true;
  }

  trackByIndex(index: number, s: any) {
    return index;
  }
}
