import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, DoCheck } from '@angular/core';

// Import the codemirror packages
import * as Codemirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
// import 'codemirror/addon/display/autorefresh';
import 'codemirror/mode/javascript/javascript';
import { handleEditorRefresh } from '../../utils/codemirror/refresh-editor';

@Component({
  selector: 'app-subscription-url-dialog',
  templateUrl: './subscription-url-dialog.component.html'
})
export class SubscriptionUrlDialogComponent implements  DoCheck {

  @Input() subscriptionUrl = '';
  @Input() subscriptionConnectionParams = '';
  @Input() selectedSubscriptionProviderId = '';
  @Input() subscriptionProviders = [];
  @Input() showDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() subscriptionUrlChange = new EventEmitter();
  @Output() subscriptionConnectionParamsChange = new EventEmitter();
  @Output() subscriptionProviderIdChange = new EventEmitter();

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

  @ViewChild('editor') editor: ElementRef & { codeMirror: CodeMirror.Editor };

  constructor() { }

  

  ngDoCheck() {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    handleEditorRefresh(this.editor && this.editor.codeMirror);
  }

  subscriptionUrlInput(event: Event) {
    if (event.target) {
      this.subscriptionUrlChange.emit((event.target as any).value);
    }
  }

  updateSubscriptionProviderId(providerId: string) {
    this.subscriptionProviderIdChange.emit(providerId);
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
