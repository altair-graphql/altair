import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
} from '@angular/core';
import { SchemaFormProperty } from 'app/modules/altair/utils/settings_addons';

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
