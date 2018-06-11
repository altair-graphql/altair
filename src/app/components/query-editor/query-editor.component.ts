import {
  Component,
  AfterViewInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ViewChild,
  HostBinding
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
import 'codemirror/addon/display/autorefresh';
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';
import 'codemirror-graphql/info';
import 'codemirror-graphql/jump';

import { marked } from 'marked';

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

  @ViewChild('editor') editor;

  @HostBinding('style.flex-grow') public resizeFactor;

  editorConfig = <any>{
    mode: 'graphql',
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    tabSize: 2,
    extraKeys: {
      'Cmd-Enter': (cm) => this.sendRequest.next(cm),
      'Ctrl-Enter': (cm) => this.sendRequest.next(cm),
      'Ctrl-Space': (cm) => cm.showHint({ completeSingle: true }),
      'Cmd-/': (cm) => cm.execCommand('toggleComment'),
      'Ctrl-/': (cm) => cm.execCommand('toggleComment')
    },
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    autoCloseBrackets: true,
    matchBrackets: true,
    autoRefresh: true,
    dragDrop: false,
    lint: {},
    hintOptions: {
      completeSingle: false
    },
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
          console.log('rendering..', text);
          return marked(text, { sanitize: true });
        }
      };
      this.editorConfig.jump = {};

      this.updateEditorSchema(this.gqlSchema);
    }
  }

  ngAfterViewInit() {
    if (this.editor) {
      this.editor.instance.on('keyup', (cm, event) => this.onKeyUp(cm, event));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // If there is a new schema, update the editor schema
    if (changes && changes.gqlSchema && changes.gqlSchema.currentValue) {
      this.updateEditorSchema(changes.gqlSchema.currentValue);
    }

    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    if (this.editor.instance) {
      this.editor.instance.refresh();
    }
  }

  /**
   * Handles the keyup event on the query editor
   * @param cm
   * @param event
   */
  onKeyUp(cm, event) {
    if (AUTOCOMPLETE_CHARS.test(event.key)) {
      this.editor.instance.execCommand('autocomplete');
    }
  }

  /**
   * Formats the query in the editor
   */
  prettifyCode() {
    // if (this.editor) {
    //   this.editor.instance.operation(() => {
    //     const len = this.editor.instance.lineCount();
    //     for (let i = 0; i < len; i++) {
    //       this.editor.instance.indentLine(i);
    //     }
    //   });
    // }
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

  onResize(resizeFactor) {
    this.resizeFactor = resizeFactor;
  }

}
