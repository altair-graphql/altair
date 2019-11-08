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
import { getPropertyRef } from 'app/utils/settings_addons';

@Component({
  selector: 'app-schema-form',
  templateUrl: './schema-form.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaFormComponent implements OnInit, OnChanges {

  @Input() schema = null;
  @Input() data = null;

  @Output() dataChange = new EventEmitter();

  schemaProperties = [];
  formData = null;

  constructor() { }

  ngOnInit() {
    // console.log('SCHEMA:', this.schema);
    if (this.schema) {
      this.updateSchemaProperties(this.schema);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // If there is a new schema, update the schema properties
    if (changes && changes.schema && changes.schema.currentValue) {
      this.updateSchemaProperties(changes.schema.currentValue);
    }
  }

  updateSchemaProperties(schema) {
    this.schemaProperties = Object.entries(schema.properties)
      .map(([ key, pty ]: any) => ({ ...pty, key }))
      .sort((a, b) => (a.key > b.key) ? 1 : -1)
      .map((pty) => {
        if (pty.$ref) {
          pty.ref = getPropertyRef(pty, schema);
          if (pty.ref && pty.ref.enum) {
            pty.refType = `enum.${pty.ref.type}`;
          }
        }
        return pty;
      });
    this.formData = JSON.parse(JSON.stringify(this.data));
    // console.log('PROPERTIES:', this.schemaProperties);
    // console.log('DATA:', this.data);
  }

  onInput(event, item) {
    // console.log(event, item);
    this.dataChange.next(this.formData);
  }

}
