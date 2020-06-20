import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  OnChanges,
  ElementRef,
  SimpleChanges,
  DoCheck,
} from '@angular/core';

// Import the codemirror packages
import * as Codemirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
// import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/scroll/annotatescrollbar';
import 'codemirror-graphql/results/mode';
import { SubscriptionResponse } from 'app/store/query/query.reducer';
import { handleEditorRefresh } from 'app/utils/codemirror/refresh-editor';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.scss']
})
export class QueryResultComponent implements OnChanges, DoCheck {

  @Input() queryResult = '';
  @Input() responseTime = 0;
  @Input() responseStatus = 0;
  @Input() responseStatusText = '';
  @Input() isSubscribed = false;
  @Input() subscriptionResponses: SubscriptionResponse[] = [];
  @Input() subscriptionUrl = '';
  @Input() tabSize = 2;
  @Input() autoscrollSubscriptionResponses = false;
  @Input() actionButtons = [];

  @Output() downloadResultChange = new EventEmitter();
  @Output() stopSubscriptionChange = new EventEmitter();
  @Output() clearSubscriptionChange = new EventEmitter();
  @Output() autoscrollSubscriptionResponsesChange = new EventEmitter();
  @Output() actionButtonClickChange = new EventEmitter();

  @ViewChild('editor', { static: true }) editor: ElementRef & { codeMirror: CodeMirror.Editor };
  @ViewChild('subscriptionResponseList', { static: true }) subscriptionResponseList: ElementRef;

  resultEditorConfig = {
    mode: 'graphql-results',
    json: true,
    tabSize: this.tabSize,
    indentUnit: this.tabSize,
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    readOnly: true,
    dragDrop: false,
    autoRefresh: true,
    theme: 'default query-result',
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: {
      'Alt-F': 'findPersistent',
      'Ctrl-F': 'findPersistent',
    },
  };

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.subscriptionResponses && changes.subscriptionResponses.currentValue) {
      const scrollTopTimeout = setTimeout(() => {
        if (this.subscriptionResponseList && this.autoscrollSubscriptionResponses) {
          this.subscriptionResponseList.nativeElement.scrollTop = this.subscriptionResponseList.nativeElement.scrollHeight;
        }
        clearTimeout(scrollTopTimeout);
      }, 50);
    }
  }

  ngDoCheck() {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    handleEditorRefresh(this.editor && this.editor.codeMirror);
  }

  subscriptionResponseTrackBy(index: number, response: SubscriptionResponse) {
    return response.responseTime;
  }
}
