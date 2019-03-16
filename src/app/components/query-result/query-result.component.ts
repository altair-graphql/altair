import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  OnChanges
} from '@angular/core';

// Import the codemirror packages
import * as Codemirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/scroll/annotatescrollbar';
import 'codemirror-graphql/results/mode';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.scss']
})
export class QueryResultComponent implements OnChanges {

  @Input() queryResult = '';
  @Input() responseTime = 0;
  @Input() responseStatus = 0;
  @Input() responseStatusText = '';
  @Input() isSubscribed = false;
  @Input() subscriptionResponses = [];
  @Input() subscriptionUrl = '';

  @Output() downloadResultChange = new EventEmitter();
  @Output() stopSubscriptionChange = new EventEmitter();
  @Output() clearSubscriptionChange = new EventEmitter();

  @ViewChild('editor') editor;

  resultEditorConfig = {
    mode: 'graphql-results',
    json: true,
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    readOnly: true,
    dragDrop: false,
    autoRefresh: true,
    theme: 'default query-result',
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: { 'Alt-F': 'findPersistent' },
  };

  constructor() {}

  ngOnChanges() {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    if (this.editor.codeMirror) {
      this.editor.codeMirror.refresh();
    }
  }
}
