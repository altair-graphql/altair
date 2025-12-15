import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  inject,
  output,
} from '@angular/core';
import { languagesSchema } from 'altair-graphql-core/build/config/languages';
import { SchemaFormProperty } from 'app/modules/altair/utils/settings_addons';

function getLanguageLabel(lang: string) {
  return (
    Object.entries(languagesSchema.enum).find(([, value]) => value === lang)?.[0] ??
    lang
  );
}
@Component({
  selector: 'app-schema-form-item',
  templateUrl: './schema-form-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SchemaFormItemComponent {
  readonly item = input<SchemaFormProperty>();
  readonly data = model<unknown>();

  readonly dataChange = output<unknown>();

  constructor() {
    // effect(() => {
    //   this.dataChange.emit(this.data());
    // });
  }

  getOptionLabel(item: SchemaFormProperty, option: string) {
    switch (item?.key) {
      case 'language':
        return getLanguageLabel(option);
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
                label: getLanguageLabel(content),
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

  asStringOrUndefined(data: unknown): string | undefined {
    if (typeof data === 'string') {
      return data;
    }
    return undefined;
  }
  asArrayOrUndefined(data: unknown): unknown[] | undefined {
    if (Array.isArray(data)) {
      return data;
    }
    return undefined;
  }
}
