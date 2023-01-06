import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { IDictionary } from 'altair-graphql-core/build/types/shared';
import { SchemaFormProperty } from 'app/modules/altair/utils/settings_addons';

@Component({
  selector: 'app-schema-form-item',
  templateUrl: './schema-form-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaFormItemComponent {
  @Input() item?: SchemaFormProperty;
  @Input() data: unknown = {};

  @Output() dataChange = new EventEmitter();

  constructor(private altairConfig: AltairConfig) {}

  getOptionLabel(item: SchemaFormProperty, option: string) {
    switch (item?.key) {
      case 'language':
        return (this.altairConfig.languages as any)[option] || option;
    }
  }
  getSelectOptions(
    item: SchemaFormProperty
  ): { label: string; value: string }[] {
    const itemRef = item.ref;
    if (itemRef) {
      const itemEnum = itemRef.enum ?? [];
      switch (item?.key) {
        case 'language':
          return itemEnum.map((content: string) => {
            return {
              label: (this.altairConfig.languages as any)[content] || content,
              value: content,
            };
          });
      }
      return itemEnum.map((content: string) => {
        return {
          label: content,
          value: content,
        };
      });
    }

    return [];
  }

  isString(data: unknown): data is string {
    return typeof data === 'string';
  }

  isArray(data: unknown): data is unknown[] {
    return Array.isArray(data);
  }

  onInput(event: Event, item: SchemaFormProperty) {
    // console.log(event, item);
    this.dataChange.next(this.data);
  }
}
