import {
  Component,
  ChangeDetectionStrategy,
  input,
  output
} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { GraphQLArgument } from 'graphql';
import { DocumentIndexEntry } from '../models';

@Component({
  selector: 'app-doc-viewer-search-results',
  templateUrl: './doc-viewer-search-results.component.html',
  styleUrls: ['./doc-viewer-search-results.component.scss'],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  animations: [
    trigger('showResultItem', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(50%)',
        }),
        animate(
          200,
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
      transition(':leave', [
        style({ height: '*' }), // Get the runtime height for use in the next transition
        animate(
          200,
          style({
            transform: 'translateY(150%)',
            opacity: 0,
            height: 0, // This works since we retrieved the runtime height previously
          })
        ),
      ]),
    ]),
  ],
  standalone: false,
  // components with animations don't work well with OnPush change detection
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocViewerSearchResultsComponent {
  readonly results = input<DocumentIndexEntry[]>([]);

  readonly goToFieldChange = output();
  readonly goToTypeChange = output();
  readonly goToDirectiveChange = output();

  /**
   * Go to an item based on the category
   * @param name
   * @param parentType
   * @param cat
   */
  goToItem(item: DocumentIndexEntry) {
    switch (item.cat) {
      case 'field':
        this.goToField(item.name, item.type);
        break;
      case 'type':
        this.goToType(item.name);
        break;
      case 'directive':
        this.goToDirective(item.name);
        break;
    }
  }

  goToField(name: string, parentType: string) {
    this.goToFieldChange.emit({ name, parentType });
  }

  goToType(name: string) {
    this.goToTypeChange.emit({ name });
  }

  goToDirective(name: string) {
    this.goToDirectiveChange.emit({ name });
  }

  /**
   * Return a proper name for the given name
   * @param name the name to refine
   */
  getProperName(name: string) {
    if (/mutation/i.test(name)) {
      return 'Mutation';
    }

    if (/query/i.test(name)) {
      return 'Query';
    }

    if (/subscription/i.test(name)) {
      return 'Subscription';
    }

    return name;
  }

  resultTrackBy(index: number, result: DocumentIndexEntry) {
    return `${result.name}.${result.type}.${result.cat}`;
  }
  resultArgTrackBy<T extends { name: string }>(index: number, arg: T) {
    return arg.name;
  }
}
