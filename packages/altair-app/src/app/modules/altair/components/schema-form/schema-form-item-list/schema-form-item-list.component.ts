import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { IDictionary } from 'altair-graphql-core/build/types/shared';
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
  @Input() item?: SchemaFormProperty;
  @Input() data: unknown[] | undefined;

  @Output() dataChange = new EventEmitter();

  addField() {
    if (!this.data || !Array.isArray(this.data)) {
      this.data = [];
    }

    this.data.push('');
    this.dataChange.next(this.data);
  }

  removeField(index: number) {
    if (this.data && Array.isArray(this.data)) {
      this.data = this.data.filter((_, i) => i !== index);
      this.dataChange.next(this.data);
    }
  }

  getSchemaFormPropertyForListItem(index: number, schema: JSONSchema6) {
    return getSchemaFormProperty(`${this.item?.key}[${index}]`, schema);
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
