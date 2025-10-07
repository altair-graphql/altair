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
  standalone: false,
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
  getSelectOptions(item: SchemaFormProperty): { label: string; value: string }[] {
    const itemRef = item.ref;
    if (itemRef) {
      const itemEnum = itemRef.enum ?? [];
      switch (item?.key) {
        case 'language':
          return itemEnum
            .filter((content): content is string => typeof content === 'string')
            .map((content) => {
              return {
                label: (this.altairConfig.languages as any)[content] || content,
                value: content,
              };
            });
      }
      return itemEnum
        .filter((content): content is string => typeof content === 'string')
        .map((content: string) => {
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

  isStringOrUndefined(data: unknown): data is string | undefined {
    return typeof data === 'string' || typeof data === 'undefined';
  }

  isArray(data: unknown): data is unknown[] {
    return Array.isArray(data);
  }

  isArrayOrUndefined(data: unknown): data is unknown[] | undefined {
    return Array.isArray(data) || typeof data === 'undefined';
  }

  asArrayOrUndefined(data: unknown): unknown[] | undefined {
    if (Array.isArray(data)) {
      return data;
    }
    return undefined;
  }

  onInput(event: Event, item: SchemaFormProperty) {
    // console.log(event, item);
    this.dataChange.next(this.data);
  }
}
