import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { GraphQLSchema, GraphQLDirective, GraphQLArgument } from 'graphql';

@Component({
  selector: 'app-doc-viewer-directive',
  templateUrl: './doc-viewer-directive.component.html',
  styleUrls: ['./doc-viewer-directive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DocViewerDirectiveComponent {
  readonly data = input<GraphQLDirective>();

  readonly gqlSchema = input<GraphQLSchema>();

  readonly goToTypeChange = output<{
    name: string;
  }>();

  goToType(name: string) {
    this.goToTypeChange.emit({ name });
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

  getLocations(directive: GraphQLDirective | undefined): string {
    if (!directive) {
      return '';
    }
    return directive.locations.join(' | ');
  }
}
