import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { languagesSchema } from 'altair-graphql-core/build/config/languages';
import { SchemaFormProperty } from 'app/modules/altair/utils/settings_addons';

@Component({
  selector: 'app-schema-form-item-select',
  standalone: false,
  templateUrl: './schema-form-item-select.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaFormItemSelectComponent {
  readonly item = input<SchemaFormProperty>();
  readonly data = model<unknown>();

  readonly dataChange = output();

  readonly selectOptions = computed(() => {
    const item = this.item();
    if (!item) {
      return [];
    }
    return getSelectOptions(item);
  });

  getOptionLabel(item: SchemaFormProperty, option: string) {
    switch (item?.key) {
      case 'language':
        return getLanguageLabel(option);
    }
  }
}

function getItemEnum(item: SchemaFormProperty) {
  const itemRef = item.ref;
  if (item.enum) {
    return item.enum;
  }
  if (itemRef) {
    return itemRef.enum ?? [];
  }
  return [];
}

function getSelectOptions(
  item: SchemaFormProperty
): { label: string; value: string }[] {
  const itemEnum = getItemEnum(item);
  if (itemEnum.length > 0) {
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

function getLanguageLabel(lang: string) {
  return (
    Object.entries(languagesSchema.enum).find(([, value]) => value === lang)?.[0] ??
    lang
  );
}
