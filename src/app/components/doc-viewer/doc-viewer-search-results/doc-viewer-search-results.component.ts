import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-doc-viewer-search-results',
  templateUrl: './doc-viewer-search-results.component.html',
  styleUrls: ['./doc-viewer-search-results.component.scss']
})
export class DocViewerSearchResultsComponent implements OnInit {

  @Input() results = null;

  @Output() goToFieldChange = new EventEmitter();
  @Output() goToTypeChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  /**
   * Go to an item based on the category
   * @param name
   * @param parentType
   * @param cat
   */
  goToItem(name, parentType, cat) {
    switch (cat) {
      case 'field':
        this.goToField(name, parentType);
        break;
      case 'type':
        this.goToType(name);
    }
  }

  goToField(name, parentType) {
    // console.log('field field', name, parentType);
    this.goToFieldChange.next({ name, parentType });
  }

  goToType(name) {
    // console.log('field type', name);
    this.goToTypeChange.next({ name });
  }

  /**
   * Return a proper name for the given name
   * @param name the name to refine
   */
  getProperName(name) {
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

}
