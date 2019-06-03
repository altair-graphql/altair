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
  NgZone,
} from '@angular/core';

import * as fromVariables from '../../reducers/variables/variables';
import * as fromQuery from '../../reducers/query/query';

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
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/scroll/annotatescrollbar';
// import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';
import 'codemirror-graphql/info';
import 'codemirror-graphql/jump';
import getTypeInfo from 'codemirror-graphql/utils/getTypeInfo';
import '../../utils/codemirror/graphql-linter';
import '../../utils/codemirror/graphql-hint';

import { GqlService, NotifyService } from 'app/services';
import { debug } from 'app/utils/logger';
import { onHasCompletion } from 'app/utils/codemirror/graphql-has-completion';

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_@(]$/;

@Component({
  selector: 'app-query-editor',
  templateUrl: './query-editor.component.html',
  styleUrls: ['./query-editor.component.scss']
})
export class QueryEditorComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() query;
  @Input() gqlSchema = null;
  @Input() tabSize = 2;
  @Input() addQueryDepthLimit = 2;

  @Input() variables: fromVariables.State = null;
  @Input() showVariableDialog = false;
  @Output() sendRequest = new EventEmitter();
  @Output() queryChange = new EventEmitter<string>();
  @Output() variablesChange = new EventEmitter();
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() addFileVariableChange = new EventEmitter();
  @Output() fileVariableNameChange = new EventEmitter();
  @Output() fileVariableDataChange = new EventEmitter();
  @Output() deleteFileVariableChange = new EventEmitter();
  @Output() queryEditorStateChange = new EventEmitter<fromQuery.QueryEditorState>();
  @Output() showTokenInDocsChange = new EventEmitter();

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
      'Cmd-Space': (cm) => cm.showHint({ completeSingle: true }),
      'Ctrl-Space': (cm) => cm.showHint({ completeSingle: true }),
      'Alt-Space': (cm) => cm.showHint({ completeSingle: true }),
      'Cmd-/': (cm) => cm.execCommand('toggleComment'),
      'Ctrl-/': (cm) => cm.execCommand('toggleComment'),

      'Alt-F': 'findPersistent',
      'Ctrl-F': 'findPersistent',

      // show current token parent type in docs
      'Ctrl-D': cm => this.zone.run(() => this.onShowInDocsByToken(cm)),

      'Shift-Ctrl-Enter': cm => this.zone.run(() => this.onFillFields(cm)),
    },
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    autoCloseBrackets: true,
    matchBrackets: true,
    autoRefresh: true,
    dragDrop: false,
    lint: {},
    hintOptions: {
      completeSingle: false,
      render: (elt: Element, data, cur) => {
        elt.classList.add('query-editor__autocomplete-item');
        elt.innerHTML = `
          <span class="query-editor__autocomplete-item__text">${cur.text}</span>
          <span class="query-editor__autocomplete-item__type">${cur.typeDetail}</span>
        `.trim().replace(/ +/g, ' ');
        // debug.log(elt, data, cur);
      }
    },
    info: {
      onClick: reference => this.zone.run(() => this.onShowInDocsByReference(reference)),
    },
    jump: {
      onClick: reference => this.zone.run(() => this.onShowInDocsByReference(reference)),
    }
  };

  constructor(
    private gqlService: GqlService,
    private notifyService: NotifyService,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    if (this.gqlSchema) {
      this.editorConfig.lint = {};
      // this.editorConfig.info = {
      //   renderDescription: text => {
      //     debug.log('rendering..', text);
      //     return marked(text, { sanitize: true });
      //   }
      // };
      this.editorConfig.tabSize = this.tabSize || 2;
      this.editorConfig.indentUnit = this.tabSize || 2;

      this.updateEditorSchema(this.gqlSchema);
    }
  }

  ngAfterViewInit() {
    if (this.editor) {
      this.editor.codeMirror.on('keyup', (cm, event) => this.onKeyUp(cm, event));
      this.editor.codeMirror.on('focus', (cm, event) => this.onEditorStateChange(cm, event));
      this.editor.codeMirror.on('blur', (cm, event) => this.onEditorStateChange(cm, event));
      this.editor.codeMirror.on('cursorActivity', (cm, event) => this.onEditorStateChange(cm, event));
      this.editor.codeMirror.on('hasCompletion', (cm, event) => this.onHasCompletion(cm, event));
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

  onEditorStateChange(cm, event) {
    const cursor = cm.getCursor();
    const cursorIndex = cm.indexFromPos(cursor);
    const isFocused = cm.hasFocus();
    this.queryEditorStateChange.next({ isFocused, cursorIndex });
  }

  onShowInDocsByToken(cm) {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    const typeInfo = getTypeInfo(this.gqlSchema, token.state);

    if (typeInfo.fieldDef && typeInfo.parentType) {
      this.showTokenInDocsChange.next({
        view: 'field',
        parentType: typeInfo.parentType.inspect(),
        name: typeInfo.fieldDef.name,
      });
    } else if (typeInfo.type) {
      this.showTokenInDocsChange.next({
        view: 'type',
        name: typeInfo.type.inspect()
      });
    }
    this.editor.codeMirror.getInputField().blur();
  }

  onShowInDocsByReference(reference) {
    if (reference.field && reference.type) {
      this.showTokenInDocsChange.next({
        view: 'field',
        parentType: reference.type.inspect(),
        name: reference.field.name,
      });
    } else if (reference.type) {
      this.showTokenInDocsChange.next({
        view: 'type',
        name: reference.type.inspect()
      });
    }
  }

  onFillFields(cm) {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    const schema = this.gqlSchema;
    if (!schema) {
      return;
    }

    const updatedQuery = this.gqlService.fillAllFields(
      schema,
      cm.getValue(),
      cursor,
      token,
      {
        maxDepth: this.addQueryDepthLimit
      }
    );

    this.queryChange.next(updatedQuery.result);
    setTimeout(() => {
      cm.setCursor(cursor);
    }, 1);
  }

  onHasCompletion(cm, event) {
    onHasCompletion(cm, event, {
      onClickHintInformation: type => {
        if (this.gqlSchema) {
          const typeDef = this.gqlSchema.getType(type);
          if (typeDef) {
            this.showTokenInDocsChange.next({
              view: 'type',
              name: typeDef.inspect()
            });
          }
        }
      }
    });
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
      this.editorConfig.info.schema = schema;
      this.editorConfig.jump.schema = schema;
    }
  }

  onResize(resizeFactor) {
    this.resizeFactor = resizeFactor;
  }

  trackByIndex(index) {
    return index;
  }

}
