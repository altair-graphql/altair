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
  ElementRef,
  DoCheck,
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
// import 'codemirror/addon/display/autorefresh';
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
import { GraphQLSchema } from 'graphql';
import { handleEditorRefresh } from 'app/utils/codemirror/refresh-editor';

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_@(]$/;

@Component({
  selector: 'app-query-editor',
  templateUrl: './query-editor.component.html',
  styleUrls: ['./query-editor.component.scss']
})
export class QueryEditorComponent implements OnInit, AfterViewInit, OnChanges, DoCheck {

  @Input() query = '';
  @Input() gqlSchema: GraphQLSchema;
  @Input() tabSize = 2;
  @Input() addQueryDepthLimit = 2;

  @Input() variables: fromVariables.State;
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

  @ViewChild('editor', { static: true }) editor: ElementRef & { codeMirror: CodeMirror.Editor };

  @HostBinding('style.flex-grow') public resizeFactor: number;

  editorConfig = <any>{
    mode: 'graphql',
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    tabSize: this.tabSize,
    indentUnit: this.tabSize,
    extraKeys: {
      'Cmd-Space': (cm: any) => cm.showHint({ completeSingle: true }),
      'Ctrl-Space': (cm: any) => cm.showHint({ completeSingle: true }),
      'Alt-Space': (cm: any) => cm.showHint({ completeSingle: true }),
      'Cmd-/': (cm: CodeMirror.Editor) => cm.execCommand('toggleComment'),
      'Ctrl-/': (cm: CodeMirror.Editor) => cm.execCommand('toggleComment'),

      'Alt-F': 'findPersistent',
      'Ctrl-F': 'findPersistent',

      // show current token parent type in docs
      'Ctrl-D': (cm: CodeMirror.Editor) => this.zone.run(() => this.onShowInDocsByToken(cm)),

      'Shift-Ctrl-Enter': (cm: CodeMirror.Editor) => this.zone.run(() => this.onFillFields(cm)),
    },
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    autoCloseBrackets: true,
    matchBrackets: true,
    autoRefresh: true,
    dragDrop: false,
    lint: {},
    hintOptions: {
      completeSingle: false,
      render: (elt: Element, data: any, cur: any) => {
        elt.classList.add('query-editor__autocomplete-item');
        elt.innerHTML = `
          <span class="query-editor__autocomplete-item__text">${cur.text}</span>
          <span class="query-editor__autocomplete-item__type">${cur.typeDetail}</span>
        `.trim().replace(/ +/g, ' ');
        // debug.log(elt, data, cur);
      }
    },
    info: {
      onClick: (reference: any) => this.zone.run(() => this.onShowInDocsByReference(reference)),
    },
    jump: {
      onClick: (reference: any) => this.zone.run(() => this.onShowInDocsByReference(reference)),
    }
  };

  widgets: CodeMirror.LineWidget[] = [];
  updateWidgetTimeout: any = null;

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
      (this.editor.codeMirror as any).on('keyup', (cm: CodeMirror.Editor, event: KeyboardEvent) => this.onKeyUp(cm, event));
      (this.editor.codeMirror as any).on('focus', (cm: CodeMirror.Editor, event: Event) => this.onEditorStateChange(cm, event));
      (this.editor.codeMirror as any).on('blur', (cm: CodeMirror.Editor, event: Event) => this.onEditorStateChange(cm, event));
      (this.editor.codeMirror as any).on('cursorActivity', (cm: CodeMirror.Editor, event: Event) => this.onEditorStateChange(cm, event));
      (this.editor.codeMirror as any).on('hasCompletion', (cm: CodeMirror.Editor, event: Event) => this.onHasCompletion(cm, event));
      (this.editor.codeMirror as any).on('change', (cm: CodeMirror.Editor, event: Event) => this.updateWidgets(cm, event));
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
  }

  ngDoCheck() {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    handleEditorRefresh(this.editor && this.editor.codeMirror);
  }

  /**
   * Handles the keyup event on the query editor
   * @param cm
   * @param event
   */
  onKeyUp(cm: CodeMirror.Editor, event: KeyboardEvent) {
    if (AUTOCOMPLETE_CHARS.test(event.key)) {
      this.editor.codeMirror.execCommand('autocomplete');
    }
  }

  onEditorStateChange(cm: CodeMirror.Editor, event: Event) {
    const cursor = cm.getDoc().getCursor();
    const cursorIndex = cm.getDoc().indexFromPos(cursor);
    const isFocused = cm.hasFocus();
    this.queryEditorStateChange.next({ isFocused, cursorIndex });
  }

  onShowInDocsByToken(cm: CodeMirror.Editor) {
    const cursor = cm.getDoc().getCursor();
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

  onShowInDocsByReference(reference: any) {
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

  onFillFields(cm: CodeMirror.Editor) {
    const cursor = cm.getDoc().getCursor();
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
      cm.getDoc().setCursor(cursor);
    }, 1);
  }

  onHasCompletion(cm: CodeMirror.Editor, event: Event) {
    onHasCompletion(cm, event, {
      onClickHintInformation: (type: string) => {
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

  updateWidgets(cm: CodeMirror.Editor, event: any) {
    const definitionsInfo: any[] = [];
    clearTimeout(this.updateWidgetTimeout);
    this.updateWidgetTimeout = setTimeout(() => {
      try {
        const ast = this.gqlService.parseQuery(cm.getValue());
        ast.definitions.forEach(definition => {
          if (definition.kind === 'OperationDefinition' && ((definition.name && definition.name.value) || ast.definitions.length === 1)) {
            debug.log('WIDGET', definition);
            definitionsInfo.push({
              operation: definition.operation,
              location: definition.loc,
              operationName: definition.name ? definition.name.value : '',
            });
          }
        });
        cm.operation(() => {
          this.widgets.forEach(widget => {
            (cm as any).removeLineWidget(widget);
            widget.clear();
          });
          this.widgets = [];

          definitionsInfo.forEach(({ operationName, operation, location }) => {
            const widgetEl = document.createElement('div');
            widgetEl.innerHTML = `&#9658; (Run ${operation}${operationName ? ` ${operationName}` : ''})`;
            widgetEl.className = 'query-editor__line-widget';
            widgetEl.onclick = () => {
              this.zone.run(() => this.sendRequest.next({ operationName }));
              debug.log('WIDGET listens');
            };

            this.widgets.push(cm.addLineWidget(location.startToken.line - 1, widgetEl, {
              above: true,
            }));
          });
        });
      } catch (error) {}

    }, 300);
  }

  /**
   * Update the editor schema
   * @param schema
   */
  updateEditorSchema(schema: GraphQLSchema) {
    if (schema) {
      debug.log('Updating schema...', schema);
      this.editorConfig.lint.schema = schema;
      this.editorConfig.hintOptions.schema = schema;
      this.editorConfig.info.schema = schema;
      this.editorConfig.jump.schema = schema;
    }
  }

  onResize(resizeFactor: number) {
    this.resizeFactor = resizeFactor;
  }

  trackByIndex(index: number) {
    return index;
  }

}
