import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, ElementRef } from '@angular/core';


// Import the codemirror packages
import * as Codemirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/mode/javascript/javascript';

@Component({
  selector: 'app-subscription-url-dialog',
  templateUrl: './subscription-url-dialog.component.html'
})
export class SubscriptionUrlDialogComponent implements OnChanges {

  @Input() subscriptionUrl = '';
  @Input() subscriptionConnectionParams = '';
  @Input() showDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() subscriptionUrlChange = new EventEmitter();
  @Output() subscriptionConnectionParamsChange = new EventEmitter();

  subscriptionConnectionParamsEditorConfig = {
    mode: 'javascript',
    json: true,
    lineWrapping: true,
    dragDrop: false,
    autoRefresh: true,
    theme: 'default subscription-params',
    gutters: [],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: {},
    hintOptions: {
      completeSingle: false
    },
    jump: {}
  };

  @ViewChild('editor', { static: false }) editor: ElementRef & { codeMirror: CodeMirror.Editor };

  constructor() { }

  ngOnChanges() {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    if (this.editor && this.editor.codeMirror) {
      this.editor.codeMirror.refresh();
    }
  }

  subscriptionUrlInput(event: Event) {
    if (event.target) {
      this.subscriptionUrlChange.next((event.target as any).value);
    }
  }

}
