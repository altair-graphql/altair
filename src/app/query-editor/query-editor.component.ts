import {
  Component,
  OnInit,
  AfterViewInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  SimpleChanges
} from '@angular/core';

// Import the codemirror packages
import Codemirror from 'codemirror';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';
import 'codemirror-graphql/info';
import 'codemirror-graphql/jump';

import { marked } from 'marked';

import { initialQuery } from './initialQuery';

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_@(]$/;

@Component({
  selector: 'app-query-editor',
  templateUrl: './query-editor.component.html',
  styleUrls: ['./query-editor.component.scss']
})
export class QueryEditorComponent implements AfterViewInit, OnChanges {

  @Output() sendRequest = new EventEmitter();

  @Output() queryChange = new EventEmitter<string>();
  @Input() query;

  @Input() gqlSchema = null;

  editorConfig = <any>{
    mode: 'graphql',
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    tabSize: 2,
    extraKeys: {
      'Cmd-Enter': (cm) => this.sendRequest.next(cm),
      'Ctrl-Enter': (cm) => this.sendRequest.next(cm),
      // 'Ctrl-Space': () => this.codeEditor.showHint({ completeSingle: true })
    },
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: {},
    hintOptions: {},
    info: {},
    jump: {}
  };

  constructor() {
    if (this.gqlSchema) {
      this.editorConfig.lint = {};
      this.editorConfig.hintOptions = {
        completeSingle: false
      };
      this.editorConfig.info = {
        renderDescription: text => {
          return marked(text, { sanitize: true });
        }
      };
      this.editorConfig.jump = {};

      this.updateEditorSchema(this.gqlSchema);
    }
  }

  ngAfterViewInit() {
    // const editorTextArea = document.querySelector('.app-query-editor-input');
    // const editorOptions = <any>{
    //   mode: 'graphql',
    //   lineWrapping: true,
    //   lineNumbers: true,
    //   foldGutter: true,
    //   tabSize: 2,
    //   extraKeys: {
    //     'Cmd-Enter': (cm) => this.sendRequest.next(cm),
    //     'Ctrl-Enter': (cm) => this.sendRequest.next(cm),
    //     'Ctrl-Space': () => this.codeEditor.showHint({ completeSingle: true })
    //   },
    //   gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    //   autoCloseBrackets: true,
    //   matchBrackets: true,
    //   lint: {},
    //   hintOptions: {},
    //   info: {},
    //   jump: {}
    // };

    // if (this.gqlSchema) {
    //   editorOptions.lint = {};
    //   editorOptions.hintOptions = {
    //     completeSingle: false
    //   };
    //   editorOptions.info = {
    //     renderDescription: text => {
    //       return marked(text, { sanitize: true });
    //     }
    //   };
    //   editorOptions.jump = {};
    // }
    // this.codeEditor = Codemirror.fromTextArea(editorTextArea, editorOptions);
    // this.codeEditor.on('change', e => this.update(e));
    // this.codeEditor.on('keyup', (cm, event) => this.onKeyUp(cm, event));
    // if (this.gqlSchema) {
    //   this.updateEditorSchema(this.gqlSchema);
    // }
  }

  ngOnChanges(changes: SimpleChanges) {
    // If there is a new schema, update the editor schema
    if (changes.gqlSchema.currentValue) {
      // const schema = changes.gqlSchema.currentValue;
      this.gqlSchema = changes.gqlSchema.currentValue;
      this.updateEditorSchema(changes.gqlSchema.currentValue);
    }
  }

  /**
   * Called when the query in the editor changes
   * @param event
   */
  update($event) {
    // this.queryChange.next(this.codeEditor.getValue());
  }

  /**
   * Handles the keyup event on the query editor
   * @param cm
   * @param event
   */
  onKeyUp(cm, event) {
    if (AUTOCOMPLETE_CHARS.test(event.key)) {
      // this.codeEditor.execCommand('autocomplete');
    }
  }

  /**
   * Formats the query in the editor
   */
  prettifyCode() {
    // this.codeEditor.operation(() => {
    //   const len = this.codeEditor.lineCount();
    //   for (let i = 0; i < len; i++) {
    //     this.codeEditor.indentLine(i);
    //   }
    // });
  }

  /**
   * Update the editor schema
   * @param schema
   */
  updateEditorSchema(schema) {
    if (schema) {
      console.log('Updating schema...', schema);
      this.editorConfig.lint.schema = schema;
      this.editorConfig.hintOptions.schema = schema;
      this.editorConfig.info.schema = schema;
      this.editorConfig.jump.schema = schema;
    }
  }

}
