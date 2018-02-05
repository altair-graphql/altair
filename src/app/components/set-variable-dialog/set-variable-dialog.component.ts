import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges
} from '@angular/core';

// Import the codemirror packages
import Codemirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/mode/javascript/javascript';

@Component({
  selector: 'app-set-variable-dialog',
  templateUrl: './set-variable-dialog.component.html',
  styleUrls: ['./set-variable-dialog.component.scss']
})
export class SetVariableDialogComponent implements OnChanges {

  @Input() showVariableDialog = false;
  @Input() variables = '';
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() variablesChange = new EventEmitter();

  @ViewChild('editor') editor;

  variableEditorConfig = {
    mode: 'javascript',
    json: true,
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    autoRefresh: true,
    dragDrop: false,
    autoCloseBrackets: true,
    theme: 'default variable-editor',
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  };

  constructor() {
    // this.store.changes
    //   .subscribe(data => {
    //     this.variables = data.variables;
    //     // this.gql.setHeaders(data.headers);
    //   });
  }

  ngOnChanges() {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    if (this.editor.instance) {
      this.editor.instance.refresh();
    }
  }

  trackByFn(index, item) {
    return index;
  }
}
