import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema } from 'graphql';

@Component({
  selector: 'app-doc-viewer-type',
  templateUrl: './doc-viewer-type.component.html',
  styleUrls: ['./doc-viewer-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocViewerTypeComponent implements OnInit {

  @Input() data: any = {};
  @Input() gqlSchema: GraphQLSchema;
  @Output() goToFieldChange = new EventEmitter();
  @Output() goToTypeChange = new EventEmitter();
  @Output() addToEditorChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  /**
   * Check if the current type is a root type
   * @param type
   */
  isRootType(type) {
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

  goToField(name, parentType) {
    this.goToFieldChange.next({ name, parentType });
  }

  goToType(name) {
    this.goToTypeChange.next({ name });
  }

  addToEditor(name, parentType) {
    this.addToEditorChange.next({ name, parentType });
  }

  // TODO: Move to service
  isGraphQLInterface(type) {
    return type instanceof GraphQLInterfaceType;
  }
  isGraphQLObject(type) {
    return type instanceof GraphQLObjectType;
  }
  /**
   * Returns an array of all the types that implement the provided type (interface)
   * @param type
   */
  getTypeImplementations(type) {
    if (this.isGraphQLInterface(type)) {
      return this.gqlSchema.getPossibleTypes(type) || [];
    }
    return [];
  }
  /**
   * Returns an array of all the interfaces implemented by type
   * @param type
   */
  getTypeImplements(type) {
    if (this.isGraphQLObject(type)) {
      return type.getInterfaces() || [];
    }
    return [];
  }

  schemaItemTrackBy(index, schemaItem) {
    return schemaItem.name;
  }
}
