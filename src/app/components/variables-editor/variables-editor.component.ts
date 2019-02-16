import { Component, Input, Output, ViewChild, EventEmitter, OnChanges } from '@angular/core';

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
  selector: 'app-variables-editor',
  templateUrl: './variables-editor.component.html',
  styleUrls: ['./variables-editor.component.scss']
})
export class VariablesEditorComponent implements OnChanges {

  @Input() variables = '';
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
    theme: 'default variable-editor mousetrap',
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  };

  constructor() { }

  ngOnChanges() {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    if (this.editor.codeMirror) {
      this.editor.codeMirror.refresh();
    }
  }

}
