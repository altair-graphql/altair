import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  input,
  effect,
} from '@angular/core';
import {
  getSchemaFormProperty,
  SchemaFormProperty,
} from '../../../utils/settings_addons';
import { JSONSchema6 } from 'json-schema';
import { IDictionary } from 'altair-graphql-core/build/types/shared';

@Component({
  selector: 'app-schema-form',
  templateUrl: './schema-form.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SchemaFormComponent {
  readonly schema = input<JSONSchema6>({});
  readonly data = input<unknown>(null);

  @Output() dataChange = new EventEmitter<IDictionary>();

  schemaProperties: SchemaFormProperty[] = [];
  formData: IDictionary = {};

  constructor() {
    effect(() => {
      const schema = this.schema();
      if (schema) {
        this.updateSchemaProperties(schema);
      }
    });
  }

  updateSchemaProperties(schema: JSONSchema6) {
    this.schemaProperties = Object.entries(schema.properties || {})
      .map(([key, pty]) => getSchemaFormProperty(key, pty))
      .sort((a, b) => (a.key > b.key ? 1 : -1));

    this.formData = JSON.parse(JSON.stringify(this.data() ?? {}));
    // console.log('PROPERTIES:', this.schemaProperties);
    // console.log('DATA:', this.data);
  }

  onInput() {
    // console.log(event, item);
    this.dataChange.next(this.formData);
  }
}
