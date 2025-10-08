import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { SortByOptions } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { GraphQLSchema, GraphQLArgument, GraphQLField } from 'graphql';

@Component({
  selector: 'app-doc-viewer-field',
  templateUrl: './doc-viewer-field.component.html',
  styleUrls: ['./doc-viewer-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DocViewerFieldComponent {
  readonly data = input<GraphQLField<unknown, unknown>>();
  readonly gqlSchema = input<GraphQLSchema>();
  readonly parentType = input('');
  readonly sortByOption = input<SortByOptions>('none');
  readonly hideDeprecatedDocItems = input<boolean>(false);

  @Output() goToFieldChange = new EventEmitter();
  @Output() goToTypeChange = new EventEmitter();
  @Output() addToEditorChange = new EventEmitter();
  @Output() sortFieldsByChange = new EventEmitter();

  fieldType = computed(() => {
    const data = this.data();
    const gqlSchema = this.gqlSchema();
    if (!gqlSchema || !data) {
      return;
    }

    return gqlSchema.getType(this.cleanName(data.type.inspect()));
  });

  cleanName(name: string) {
    return name.replace(/[[\]!]/g, '');
  }

  /**
   * Check if the current type is a root type
   * @param type
   */
  isRootType(type: string) {
    const gqlSchema = this.gqlSchema();
    if (!type || !gqlSchema) {
      return false;
    }

    switch (type) {
      case gqlSchema.getQueryType() && gqlSchema.getQueryType()!.name:
      case gqlSchema.getMutationType() && gqlSchema.getMutationType()!.name:
      case gqlSchema.getSubscriptionType() && gqlSchema.getSubscriptionType()!.name:
        return true;
    }

    return false;
  }

  goToField(name: string, parentType: string) {
    this.goToFieldChange.next({ name, parentType });
  }

  goToType(name: string) {
    this.goToTypeChange.next({ name });
  }

  addToEditor(data: { name: string; parentType: string }) {
    this.addToEditorChange.next(data);
  }

  argTrackBy(index: number, arg: GraphQLArgument) {
    return arg.name;
  }

  getDefaultValue(arg: GraphQLArgument) {
    if (typeof arg.defaultValue !== 'undefined') {
      return JSON.stringify(arg.defaultValue);
    }
    return;
  }
}
