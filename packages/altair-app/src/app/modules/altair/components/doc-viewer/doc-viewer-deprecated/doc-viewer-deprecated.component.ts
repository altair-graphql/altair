import { Component, Input } from '@angular/core';
import { GraphQLEnumValue, GraphQLField } from 'graphql';

@Component({
  selector: 'app-doc-viewer-deprecated',
  templateUrl: './doc-viewer-deprecated.component.html',
  styles: [],
})
export class DocViewerDeprecatedComponent {
  @Input() item?: GraphQLField<any, any> | GraphQLEnumValue;
}
