import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input
} from '@angular/core';
import { SortByOptions } from 'altair-graphql-core/build/types/state/collection.interfaces';
import {
  GraphQLSchema,
  GraphQLType,
  GraphQLArgs,
  GraphQLArgument,
  GraphQLField,
  GraphQLInputField,
} from 'graphql';

@Component({
  selector: 'app-doc-viewer-field',
  templateUrl: './doc-viewer-field.component.html',
  styleUrls: ['./doc-viewer-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DocViewerFieldComponent {
  @Input() data?: GraphQLField<any, any>;
  @Input() gqlSchema?: GraphQLSchema;
  readonly parentType = input('');
  readonly sortByOption = input<SortByOptions>('none');
  readonly hideDeprecatedDocItems = input<boolean>(false);

  @Output() goToFieldChange = new EventEmitter();
  @Output() goToTypeChange = new EventEmitter();
  @Output() addToEditorChange = new EventEmitter();
  @Output() sortFieldsByChange = new EventEmitter();

  cleanName(name: string) {
    return name.replace(/[[\]!]/g, '');
  }

  /**
   * Check if the current type is a root type
   * @param type
   */
  isRootType(type: string) {
    if (!type || !this.gqlSchema) {
      return false;
    }

    switch (type) {
      case this.gqlSchema.getQueryType() && this.gqlSchema.getQueryType()!.name:
      case this.gqlSchema.getMutationType() &&
        this.gqlSchema.getMutationType()!.name:
      case this.gqlSchema.getSubscriptionType() &&
        this.gqlSchema.getSubscriptionType()!.name:
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
