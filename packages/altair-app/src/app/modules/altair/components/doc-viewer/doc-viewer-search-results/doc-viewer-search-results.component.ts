import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DocumentIndexEntry } from '../models';

@Component({
  selector: 'app-doc-viewer-search-results',
  templateUrl: './doc-viewer-search-results.component.html',
  styleUrls: ['./doc-viewer-search-results.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocViewerSearchResultsComponent {
  readonly results = input<DocumentIndexEntry[]>([]);

  readonly goToFieldChange = output<{
    name: string;
    parentType: string;
  }>();
  readonly goToTypeChange = output<{
    name: string;
  }>();
  readonly goToDirectiveChange = output<{
    name: string;
  }>();

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
