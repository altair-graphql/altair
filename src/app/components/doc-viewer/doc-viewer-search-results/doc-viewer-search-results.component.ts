import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-doc-viewer-search-results',
  templateUrl: './doc-viewer-search-results.component.html',
  styleUrls: ['./doc-viewer-search-results.component.scss'],
  animations: [
    trigger('showResultItem', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(50%)',
        }),
        animate(200, style({
          opacity: 1,
          transform: 'translateY(0)',
        }))
      ]),
      transition(':leave', [
        style({ height: '*' }), // Get the runtime height for use in the next transition
        animate(200, style({
          transform: 'translateY(150%)',
          opacity: 0,
          height: 0 // This works since we retrieved the runtime height previously
        }))
      ])
    ])
  ]
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
    this.goToFieldChange.next({ name, parentType });
  }

  goToType(name) {
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
