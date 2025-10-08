import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input
} from '@angular/core';
import { GraphQLSchema, GraphQLDirective, GraphQLArgument } from 'graphql';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-doc-viewer-directive',
  templateUrl: './doc-viewer-directive.component.html',
  styleUrls: ['./doc-viewer-directive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DocViewerDirectiveComponent {
  @Input() set data(directive: GraphQLDirective | undefined) {
    this.dataSubject.next(directive);
  }
  get data(): void {
    return undefined;
  }

  readonly gqlSchema = input<GraphQLSchema>();

  @Output() goToTypeChange = new EventEmitter();

  private dataSubject = new BehaviorSubject<GraphQLDirective | undefined>(undefined);
  data$ = this.dataSubject.asObservable();

  goToType(name: string) {
    this.goToTypeChange.next({ name });
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
