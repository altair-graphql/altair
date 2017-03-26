import { Component, OnInit, Output, EventEmitter } from '@angular/core';

// Import the codemirror packages
import Codemirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';

@Component({
  selector: 'app-query-editor',
  templateUrl: './query-editor.component.html',
  styleUrls: ['./query-editor.component.scss']
})
export class QueryEditorComponent implements OnInit {

  @Output() updateQuery = new EventEmitter<string>();

  codeEditor = null;

  constructor() { }

  ngOnInit() {
    const editorTextArea = document.querySelector('.app-query-editor-input');
    this.codeEditor = Codemirror.fromTextArea(editorTextArea, {
      mode: 'graphql',
      lineWrapping: true,
      lineNumbers: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    });
    this.codeEditor.on('change', e => this.update(e));
  }

  update($event){
    console.log('Update.');
    this.updateQuery.next(this.codeEditor.getValue());
  }

}
