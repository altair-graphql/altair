import {
  Component,
  OnInit,
  AfterViewInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ViewChild,
  HostBinding,
  NgZone
} from '@angular/core';

import * as fromVariables from '../../reducers/variables/variables';

// Import the codemirror packages
import * as Codemirror from 'codemirror';
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
// import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';
// import 'codemirror-graphql/info';
import 'codemirror-graphql/jump';
import '../../utils/codemirror/graphql-linter';

import { marked } from 'marked';
import { GqlService, NotifyService } from 'app/services';
import { debug } from 'app/utils/logger';

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_@(]$/;

@Component({
  selector: 'app-query-editor',
  templateUrl: './query-editor.component.html',
  styleUrls: ['./query-editor.component.scss']
})
export class QueryEditorComponent implements OnInit, AfterViewInit, OnChanges {

  @Output() sendRequest = new EventEmitter();
  @Output() queryChange = new EventEmitter<string>();
  @Input() query;
  @Input() gqlSchema = null;
  @Input() tabSize = 2;

  @Input() variables: fromVariables.State = null;
  @Input() showVariableDialog = false;
  @Output() variablesChange = new EventEmitter();
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() addFileVariableChange = new EventEmitter();
  @Output() fileVariableNameChange = new EventEmitter();
  @Output() fileVariableDataChange = new EventEmitter();
  @Output() deleteFileVariableChange = new EventEmitter();

  @ViewChild('editor') editor;

  @HostBinding('style.flex-grow') public resizeFactor;

  editorConfig = <any>{
    mode: 'graphql',
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    tabSize: this.tabSize,
    indentUnit: this.tabSize,
    extraKeys: {
      'Cmd-Enter': (cm) => this.zone.run(() => this.sendRequest.next(cm)),
      'Ctrl-Enter': (cm) => this.zone.run(() => this.sendRequest.next(cm)),
      'Cmd-Space': (cm) => cm.showHint({ completeSingle: true }),
      'Ctrl-Space': (cm) => cm.showHint({ completeSingle: true }),
      'Alt-Space': (cm) => cm.showHint({ completeSingle: true }),
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
    // info: {},
    jump: {}
  };

  constructor(
    private gqlService: GqlService,
    private notifyService: NotifyService,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    if (this.gqlSchema) {
      this.editorConfig.lint = {};
      this.editorConfig.hintOptions = {
        completeSingle: false
      };
      // this.editorConfig.info = {
      //   renderDescription: text => {
      //     console.log('rendering..', text);
      //     return marked(text, { sanitize: true });
      //   }
      // };
      this.editorConfig.jump = {};
      this.editorConfig.tabSize = this.tabSize || 2;
      this.editorConfig.indentUnit = this.tabSize || 2;

      this.updateEditorSchema(this.gqlSchema);
    }
  }

  ngAfterViewInit() {
    if (this.editor) {
      this.editor.codeMirror.on('keyup', (cm, event) => this.onKeyUp(cm, event));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // If there is a new schema, update the editor schema
    if (changes && changes.gqlSchema && changes.gqlSchema.currentValue) {
      this.updateEditorSchema(changes.gqlSchema.currentValue);
      // Validate the schema to know if we can work with it
      const validationErrors = this.gqlService.validateSchema(changes.gqlSchema.currentValue);
      if (validationErrors.length) {
        const errorList = validationErrors.map(error => '<br><br>' + error.message).join('');
        this.notifyService.warning(`
          The schema definition is invalid according to the GraphQL specs.
          Linting and other functionalities would be unavailable.
          ${errorList}
        `, 'Altair', { disableTimeOut: true });
      }
    }

    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    if (this.editor.codeMirror) {
      this.editor.codeMirror.refresh();
    }
  }

  /**
   * Handles the keyup event on the query editor
   * @param cm
   * @param event
   */
  onKeyUp(cm, event) {
    if (AUTOCOMPLETE_CHARS.test(event.key)) {
      this.editor.codeMirror.execCommand('autocomplete');
    }
  }

  /**
   * Formats the query in the editor
   */
  prettifyCode() {
    // if (this.editor) {
    //   this.editor.codeMirror.operation(() => {
    //     const len = this.editor.codeMirror.lineCount();
    //     for (let i = 0; i < len; i++) {
    //       this.editor.codeMirror.indentLine(i);
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
      debug.log('Updating schema...', schema);
      this.editorConfig.lint.schema = schema;
      this.editorConfig.hintOptions.schema = schema;
      // this.editorConfig.info.schema = schema;
      this.editorConfig.jump.schema = schema;
    }
  }

  onResize(resizeFactor) {
    this.resizeFactor = resizeFactor;
  }

}
