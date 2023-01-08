import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  getPropertyRef,
  getSchemaFormProperty,
  SchemaFormProperty,
} from '../../../utils/settings_addons';
import { JSONSchema6Definition, JSONSchema6 } from 'json-schema';
import { IDictionary } from 'altair-graphql-core/build/types/shared';

@Component({
  selector: 'app-schema-form',
  templateUrl: './schema-form.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaFormComponent implements OnInit, OnChanges {
  @Input() schema = {};
  @Input() data = null;

  @Output() dataChange = new EventEmitter<IDictionary>();

  schemaProperties: SchemaFormProperty[] = [];
  formData: IDictionary = {};

  ngOnInit() {
    // console.log('SCHEMA:', this.schema);
    if (this.schema) {
      this.updateSchemaProperties(this.schema);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // If there is a new schema, update the schema properties
    if (changes?.schema?.currentValue) {
      this.updateSchemaProperties(changes.schema.currentValue);
    }
  }

  updateSchemaProperties(schema: JSONSchema6) {
    this.schemaProperties = Object.entries(schema.properties || {})
      .map(([key, pty]) => getSchemaFormProperty(key, pty))
      .sort((a, b) => (a.key > b.key ? 1 : -1));

    this.formData = JSON.parse(JSON.stringify(this.data));
    // console.log('PROPERTIES:', this.schemaProperties);
    // console.log('DATA:', this.data);
  }

  onInput(event: Event, item: SchemaFormProperty) {
    // console.log(event, item);
    this.dataChange.next(this.formData);
  }
}
