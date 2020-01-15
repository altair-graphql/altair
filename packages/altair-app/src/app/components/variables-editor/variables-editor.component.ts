import { Component, Input, Output, ViewChild, EventEmitter, OnChanges, ElementRef, DoCheck } from '@angular/core';

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
import { handleEditorRefresh } from 'app/utils/codemirror/refresh-editor';

@Component({
  selector: 'app-variables-editor',
  templateUrl: './variables-editor.component.html',
  styleUrls: ['./variables-editor.component.scss']
})
export class VariablesEditorComponent implements OnChanges, DoCheck {

  @Input() variables = '';
  @Output() variablesChange = new EventEmitter();

  @ViewChild('editor', { static: true }) editor: ElementRef & { codeMirror: CodeMirror.Editor };

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
  }

  ngDoCheck() {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    handleEditorRefresh(this.editor && this.editor.codeMirror);
  }

}
