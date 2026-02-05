import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
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
  readonly filters = input<Set<string>>(new Set());

  readonly filteredResults = computed(() => {
    const results = this.results();
    const filters = this.filters();
    
    if (!results || !results.length) {
      return [];
    }

    // If no filters are active, show all results
    if (filters.size === 0) {
      return results;
    }

    return results.filter(item => {
      // Check if it's a directive
      if (item.cat === 'directive') {
        return filters.has('directives');
      }

      // Check if it's a type
      if (item.cat === 'type') {
        return filters.has('types');
      }

      // For fields, we need to determine if they are queries, mutations, or subscriptions
      if (item.cat === 'field') {
        if (item.isQuery && item.type) {
          // Use exact comparison for root operation types
          const typeName = item.type;
          if (typeName === 'Query') {
            return filters.has('queries');
          }
          if (typeName === 'Mutation') {
            return filters.has('mutations');
          }
          if (typeName === 'Subscription') {
            return filters.has('subscriptions');
          }
          // If isQuery is true but type doesn't match known root types, treat as regular field
          return filters.has('fields');
        } else {
          // Regular field (not a root query/mutation/subscription)
          return filters.has('fields');
        }
      }

      return false;
    });
  });

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
