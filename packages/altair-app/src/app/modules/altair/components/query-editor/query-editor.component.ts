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
} from '@angular/core';

import sanitizeHtml from 'sanitize-html';
import {
  updateSchema,
  showInDocsCommand,
  fillAllFieldsCommands,
} from 'altair-codemirror-graphql';

// Import the codemirror packages
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
import 'codemirror/keymap/sublime';
// import 'codemirror-graphql/hint'; // We use a custom hint addon instead
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';
import 'codemirror-graphql/info';
import 'codemirror-graphql/jump';
const getTypeInfo = require('codemirror-graphql/utils/getTypeInfo');
import '../../utils/codemirror/graphql-linter';
import '../../utils/codemirror/graphql-hint';

import { GqlService, NotifyService } from '../../services';
import { debug } from '../../utils/logger';
import { onHasCompletion } from '../../utils/codemirror/graphql-has-completion';
import { GraphQLSchema } from 'graphql';
import { handleEditorRefresh } from '../../utils/codemirror/refresh-editor';
import { IDictionary } from '../../interfaces/shared';
import { VariableState } from 'altair-graphql-core/build/types/state/variable.interfaces';
import { QueryEditorState } from 'altair-graphql-core/build/types/state/query.interfaces';
import { Compartment, EditorState, Extension } from '@codemirror/state';
import { getCodemirrorGraphqlExtensions, noOpCommand } from './gql-extensions';
import { Position, posToOffset } from '../../utils/editor/helpers';
import { startCompletion } from '@codemirror/autocomplete';
import { Command, EditorView, keymap } from '@codemirror/view';
import { toggleComment } from '@codemirror/commands';
import { CodemirrorComponent } from '../codemirror/codemirror.component';
import { indentUnit } from '@codemirror/language';
import { ResizeEvent } from 'angular-resizable-element';
import { openSearchPanel } from '@codemirror/search';

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_@(]$/;

@Component({
  selector: 'app-query-editor',
  templateUrl: './query-editor.component.html',
  styleUrls: ['./query-editor.component.scss'],
})
export class QueryEditorComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() activeWindowId = null;
  @Input() query = '';
  @Input() gqlSchema: GraphQLSchema;
  @Input() tabSize = 2;
  @Input() addQueryDepthLimit = 2;

  @Input() variables: VariableState;
  @Input() showVariableDialog = false;
  @Input() variableToType: IDictionary;

  @Input() shortcutMapping: IDictionary = {};
  @Input() enableExperimental = false;

  @Input() preRequest: any = {};
  @Output() preRequestScriptChange = new EventEmitter();
  @Output() preRequestEnabledChange = new EventEmitter();

  @Input() postRequest: any = {};
  @Output() postRequestScriptChange = new EventEmitter();
  @Output() postRequestEnabledChange = new EventEmitter();

  @Output() sendRequest = new EventEmitter();
  @Output() queryChange = new EventEmitter<string>();
  @Output() variablesChange = new EventEmitter();
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() addFileVariableChange = new EventEmitter();
  @Output() fileVariableNameChange = new EventEmitter();
  @Output() fileVariableIsMultipleChange = new EventEmitter();
  @Output() fileVariableDataChange = new EventEmitter();
  @Output() deleteFileVariableChange = new EventEmitter();
  @Output() queryEditorStateChange = new EventEmitter<QueryEditorState>();
  @Output() showTokenInDocsChange = new EventEmitter();

  @ViewChild('editor') editor: ElementRef & {
    codeMirror: CodeMirror.Editor;
  };

  // TODO: Add static: true
  @ViewChild('newEditor') newEditor: CodemirrorComponent | undefined;

  @HostBinding('style.flex-grow') public resizeFactor: number;

  selectedIndex = 0;

  variableEditorHeight = '50%';

  actionToFn: Record<string, string | ((cm: CodeMirror.Editor) => void)> = {
    showAutocomplete: (cm: any) => cm.showHint({ completeSingle: true }),
    toggleComment: (cm: CodeMirror.Editor) => cm.execCommand('toggleComment'),
    showFinder: 'findPersistent',
    showInDocs: (cm: CodeMirror.Editor) =>
      this.zone.run(() => this.onShowInDocsByToken(cm)),
    fillAllFields: (cm: CodeMirror.Editor) =>
      this.zone.run(() => this.onFillFields(cm)),
    noOp: (cm: CodeMirror.Editor) => {},
  };

  cm6ActionToFn: Record<string, Command> = {
    showAutocomplete: startCompletion,
    toggleComment: toggleComment,
    showFinder: openSearchPanel,
    showInDocs: showInDocsCommand,
    fillAllFields: fillAllFieldsCommands,
    noOp: noOpCommand,
  };

  extraKeys: Record<string, string> = {};

  tabSizeCompartment = new Compartment();
  extraKeysCompartment = new Compartment();

  editorExtensions: Extension[] = this.graphqlExtension();

  editorConfig = <any>{
    mode: 'graphql',
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    tabSize: this.tabSize,
    indentUnit: this.tabSize,
    extraKeys: {
      'Cmd-Space': this.getShortcutFn('showAutocomplete'),
      'Ctrl-Space': this.getShortcutFn('showAutocomplete'),
      'Alt-Space': this.getShortcutFn('showAutocomplete'),
      'Cmd-/': this.getShortcutFn('toggleComment'),
      'Ctrl-/': this.getShortcutFn('toggleComment'),

      'Alt-F': this.getShortcutFn('showFinder'),
      'Ctrl-F': this.getShortcutFn('showFinder'),

      // show current token parent type in docs
      'Ctrl-D': this.getShortcutFn('showInDocs'),

      'Shift-Ctrl-Enter': this.getShortcutFn('fillAllFields'),
      'Ctrl-Enter': this.getShortcutFn('noOp'),
      'Cmd-Enter': this.getShortcutFn('noOp'),
    },
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    keyMap: 'sublime',
    autoCloseBrackets: true,
    matchBrackets: true,
    autoRefresh: true,
    dragDrop: false,
    lint: {},
    hintOptions: {
      completeSingle: false,
      render: (elt: Element, data: any, cur: any) => {
        elt.classList.add('query-editor__autocomplete-item');
        const content = `
          <span class="query-editor__autocomplete-item__text">${cur.text}</span>
          <span class="query-editor__autocomplete-item__type">${cur.typeDetail}</span>
        `
          .trim()
          .replace(/ +/g, ' ');
        elt.innerHTML = sanitizeHtml(content);
        // debug.log(elt, data, cur);
      },
    },
    info: {
      onClick: (reference: any) =>
        this.zone.run(() => this.onShowInDocsByReference(reference)),
      render() {
        /** Disable rendering of info addon */
      },
    },
    jump: {
      onClick: (reference: any) =>
        this.zone.run(() => this.onShowInDocsByReference(reference)),
    },
  };

  widgets: CodeMirror.LineWidget[] = [];
  updateWidgetTimeout: any = null;

  constructor(
    private gqlService: GqlService,
    private notifyService: NotifyService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    if (this.gqlSchema) {
      this.editorConfig.lint = {};

      this.editorConfig.tabSize = this.tabSize || 2;
      this.editorConfig.indentUnit = this.tabSize || 2;

      this.updateEditorSchema(this.gqlSchema);
      this.updateNewEditorSchema(this.gqlSchema);
    }
  }

  ngAfterViewInit() {
    if (this.editor?.codeMirror) {
      (this.editor.codeMirror as any).on(
        'keyup',
        (cm: CodeMirror.Editor, event: KeyboardEvent) => this.onKeyUp(cm, event)
      );
      (this.editor.codeMirror as any).on(
        'focus',
        (cm: CodeMirror.Editor, event: Event) =>
          this.onEditorStateChange(cm, event)
      );
      (this.editor.codeMirror as any).on(
        'blur',
        (cm: CodeMirror.Editor, event: Event) =>
          this.onEditorStateChange(cm, event)
      );
      (this.editor.codeMirror as any).on(
        'cursorActivity',
        (cm: CodeMirror.Editor, event: Event) =>
          this.onEditorStateChange(cm, event)
      );
      (this.editor.codeMirror as any).on(
        'hasCompletion',
        (cm: CodeMirror.Editor, event: Event) => this.onHasCompletion(cm, event)
      );
      (this.editor.codeMirror as any).on(
        'change',
        (cm: CodeMirror.Editor, event: Event) => this.updateWidgets(cm, event)
      );
    }
    this.updateNewEditorSchema(this.gqlSchema);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    handleEditorRefresh(this.editor && this.editor.codeMirror);
    // If there is a new schema, update the editor schema
    if (changes?.gqlSchema?.currentValue) {
      this.updateNewEditorSchema(changes.gqlSchema.currentValue);
      this.updateEditorSchema(changes.gqlSchema.currentValue);
      // Validate the schema to know if we can work with it
      const validationErrors = this.gqlService.validateSchema(
        changes.gqlSchema.currentValue
      );
      if (validationErrors.length) {
        const errorList = validationErrors
          .map((error) => '<br><br>' + error.message)
          .join('');
        this.notifyService.warning(
          `
          The schema definition is invalid according to the GraphQL specs.
          Linting and other functionalities would be unavailable.
          ${errorList}
        `,
          'Altair',
          { disableTimeOut: true }
        );
      }
    }

    if (changes?.tabSize?.currentValue) {
      this.editorConfig.tabSize = this.tabSize;
      this.editorConfig.indentUnit = this.tabSize;
      if (this.newEditor?.view) {
        this.newEditor.view.dispatch({
          effects: this.tabSizeCompartment.reconfigure(
            this.setTabSizeExtension(this.tabSize)
          ),
        });
      }
    }

    if (changes?.query?.currentValue) {
      // Set current tab to Query if query is updated
      this.selectedIndex = 0;
    }

    if (changes?.shortcutMapping?.currentValue) {
      // Update the editor shortcuts based on the provided shortcuts
      this.updateEditorShortcuts(changes.shortcutMapping.currentValue);
    }

    if (changes?.activeWindowId?.currentValue) {
      handleEditorRefresh(this.editor?.codeMirror);
    }
  }

  setTabSizeExtension(tabSize: number) {
    return [
      indentUnit.of(' '.repeat(tabSize)),
      EditorState.tabSize.of(tabSize),
    ];
  }

  buildExtraKeysExtension(extraKeys?: Record<string, string>) {
    if (!extraKeys) {
      return [];
    }
    return keymap.of(
      Object.entries(extraKeys).map(([key, actionStr]) => {
        return {
          key,
          run: this.getCm6ShortcutFn(actionStr),
        };
      })
    );
  }

  editorStateListener() {
    let previousCursorIdx = -1;
    return EditorView.updateListener.of((vu) => {
      const currentCursorIdx = vu.state.selection.main.head;
      if (vu.focusChanged || currentCursorIdx !== previousCursorIdx) {
        this.zone.run(() => {
          this.queryEditorStateChange.next({
            isFocused: vu.view.hasFocus,
            cursorIndex: currentCursorIdx,
          });
        });

        previousCursorIdx = currentCursorIdx;
      }
    });
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
        name: typeInfo.type.inspect(),
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
        name: reference.type.inspect(),
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
      new Position(cursor.line, cursor.ch),
      token,
      {
        maxDepth: this.addQueryDepthLimit,
      }
    );

    this.queryChange.next(updatedQuery.result);
    const setCursorTimeout = setTimeout(() => {
      cm.getDoc().setCursor(cursor);
      clearTimeout(setCursorTimeout);
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
              name: typeDef.inspect(),
            });
          }
        }
      },
    });
  }

  updateWidgets(cm: CodeMirror.Editor, event: any) {
    this.zone.runOutsideAngular(() => {
      const definitionsInfo: any[] = [];
      clearTimeout(this.updateWidgetTimeout);
      this.updateWidgetTimeout = setTimeout(() => {
        try {
          const ast = this.gqlService.parseQueryOrEmptyDocument(cm.getValue());
          ast.definitions.forEach((definition) => {
            if (
              definition.kind === 'OperationDefinition' &&
              (definition.name?.value || ast.definitions.length === 1)
            ) {
              debug.log('WIDGET', definition);
              definitionsInfo.push({
                operation: definition.operation,
                location: definition.loc,
                operationName: definition.name?.value ?? '',
              });
            }
          });
          cm.operation(() => {
            this.widgets.forEach((widget) => {
              (cm as any).removeLineWidget(widget);
              widget.clear();
            });
            this.widgets = [];

            definitionsInfo.forEach(
              ({ operationName, operation, location }) => {
                const widgetEl = document.createElement('div');
                widgetEl.innerHTML = sanitizeHtml(
                  `&#9658; (Run ${operation}${
                    operationName ? ` ${operationName}` : ''
                  })`
                );
                widgetEl.className = 'query-editor__line-widget';
                widgetEl.onclick = () => {
                  this.zone.run(() => this.sendRequest.next({ operationName }));
                  debug.log('WIDGET listens');
                };

                this.widgets.push(
                  cm.addLineWidget(location.startToken.line - 1, widgetEl, {
                    above: true,
                  })
                );
              }
            );
          });
        } catch (error) {
          console.error(error);
        } finally {
          clearTimeout(this.updateWidgetTimeout);
        }
      }, 300);
    });
  }

  graphqlExtension() {
    return [
      ...getCodemirrorGraphqlExtensions({
        onShowInDocs: (field, type, parentType) => {
          this.zone.run(() => {
            if (field && parentType) {
              this.showTokenInDocsChange.next({
                view: 'field',
                parentType: parentType,
                name: field,
              });
            } else if (type) {
              this.showTokenInDocsChange.next({
                view: 'type',
                name: type,
              });
            }
          });
        },
        onFillAllFields: (view, schema, query, cursor, token) => {
          this.zone.run(() => {
            const updatedQuery = this.gqlService.fillAllFields(
              schema,
              query,
              cursor,
              token,
              {
                maxDepth: this.addQueryDepthLimit,
              }
            );

            this.queryChange.next(updatedQuery.result);
            const setCursorTimeout = setTimeout(() => {
              view.dispatch({
                selection: { anchor: posToOffset(view.state.doc, cursor) },
              });
              clearTimeout(setCursorTimeout);
            }, 1);
          });
        },
        onRunActionClick: (operationType, operationName) => {
          this.zone.run(() => this.sendRequest.next({ operationName }));
        },
      }),
      this.tabSizeCompartment.of(this.setTabSizeExtension(this.tabSize)),
      this.extraKeysCompartment.of(
        this.buildExtraKeysExtension(this.extraKeys)
      ),
      this.editorStateListener(),
    ];
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

  updateNewEditorSchema(schema: GraphQLSchema) {
    if (schema && this.newEditor?.view) {
      debug.log('Updating schema for new editor...', schema);
      updateSchema(this.newEditor.view, schema);
    }
  }

  getShortcutFn(actionName: string) {
    return this.actionToFn[actionName];
  }

  getCm6ShortcutFn(actionName: string) {
    return this.cm6ActionToFn[actionName];
  }

  updateEditorShortcuts(extraKeys: Record<string, string>) {
    const normalized = Object.keys(extraKeys).reduce(
      (acc, cur) => ({ ...acc, [cur]: this.getShortcutFn(extraKeys[cur]) }),
      {}
    );

    this.editorConfig.extraKeys = {
      ...this.editorConfig.extraKeys,
      ...normalized,
    };

    this.extraKeys = extraKeys;
    if (this.newEditor?.view) {
      this.newEditor.view.dispatch({
        effects: this.extraKeysCompartment.reconfigure(
          this.buildExtraKeysExtension(extraKeys)
        ),
      });
    }
  }

  onResize(resizeFactor: number) {
    this.resizeFactor = resizeFactor;
  }

  // using arrow function, as it seems the this context in angular-resize-element is changed
  validate = (event: ResizeEvent): boolean => {
    const MIN_DIMENSIONS_PX = 50;
    if (!this.showVariableDialog) {
      return false;
    }

    if (event.rectangle.height && event.rectangle.height < MIN_DIMENSIONS_PX) {
      return false;
    }
    return true;
  };

  onResizeEnd(event: ResizeEvent): void {
    console.log(event);
    const height = event.rectangle.height;

    if (height) {
      this.variableEditorHeight = `${height}px`;
    }
  }

  trackByIndex(index: number) {
    return index;
  }
}
