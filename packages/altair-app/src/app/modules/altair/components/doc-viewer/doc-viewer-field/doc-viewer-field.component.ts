import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { GraphQLSchema, GraphQLType, GraphQLArgs, GraphQLArgument } from 'graphql';

@Component({
  selector: 'app-doc-viewer-field',
  templateUrl: './doc-viewer-field.component.html',
  styleUrls: ['./doc-viewer-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocViewerFieldComponent  {
  @Input() data: any = {};
  @Input() gqlSchema: GraphQLSchema;
  @Input() parentType = '';
  @Output() goToFieldChange = new EventEmitter();
  @Output() goToTypeChange = new EventEmitter();
  @Output() addToEditorChange = new EventEmitter();

  constructor() { }

  

  cleanName(name: string) {
    return name.replace(/[\[\]!]/g, '');
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
      case this.gqlSchema.getMutationType() && this.gqlSchema.getMutationType()!.name:
      case this.gqlSchema.getSubscriptionType() && this.gqlSchema.getSubscriptionType()!.name:
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

  addToEditor(data: { name: string, parentType: string }) {
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
