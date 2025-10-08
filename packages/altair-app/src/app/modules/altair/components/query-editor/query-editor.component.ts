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
  input,
  computed,
} from '@angular/core';

import { updateSchema, showInDocsCommand, fillAllFieldsCommands } from 'cm6-graphql';

import { GqlService, NotifyService } from '../../services';
import { debug } from '../../utils/logger';
import { GraphQLSchema } from 'graphql';
import { IDictionary } from '../../interfaces/shared';
import {
  FileVariable,
  VariableState,
} from 'altair-graphql-core/build/types/state/variable.interfaces';
import { QueryEditorState } from 'altair-graphql-core/build/types/state/query.interfaces';
import { Compartment, EditorState, Extension } from '@codemirror/state';
import { getCodemirrorGraphqlExtensions, noOpCommand } from './gql-extensions';
import { posToOffset } from '../../utils/editor/helpers';
import { startCompletion } from '@codemirror/autocomplete';
import { Command, EditorView, keymap, lineNumbers } from '@codemirror/view';
import { toggleComment } from '@codemirror/commands';
import { CodemirrorComponent } from '../codemirror/codemirror.component';
import { indentUnit } from '@codemirror/language';
import { ResizeEvent } from 'angular-resizable-element';
import { openSearchPanel } from '@codemirror/search';
import { updateGqlVariables, updateWindowId } from './upload-widget';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { TODO } from 'altair-graphql-core/build/types/shared';
import { PrerequestState } from 'altair-graphql-core/build/types/state/prerequest.interfaces';
import { PostrequestState } from 'altair-graphql-core/build/types/state/postrequest.interfaces';
import { getTokenAtPosition } from 'graphql-language-service';
import {
  AuthorizationState,
  AuthorizationTypes,
} from 'altair-graphql-core/build/types/state/authorization.interface';
import { isAuthorizationEnabled } from '../../store';

@Component({
  selector: 'app-query-editor',
  templateUrl: './query-editor.component.html',
  styleUrls: ['./query-editor.component.scss'],
  standalone: false,
})
export class QueryEditorComponent implements OnInit, AfterViewInit, OnChanges {
  readonly windowId = input('');
  readonly activeWindowId = input('');
  readonly query = input('');
  readonly gqlSchema = input<GraphQLSchema>();
  readonly tabSize = input(2);
  readonly addQueryDepthLimit = input(2);
  readonly disableLineNumbers = input(false);

  readonly variables = input<VariableState>();
  @Input() showVariableDialog = false;
  readonly variableToType = input<IDictionary>();

  readonly shortcutMapping = input<IDictionary>({});
  readonly enableExperimental = input(false);

  readonly preRequest = input<PrerequestState>();
  readonly postRequest = input<PostrequestState>();

  readonly authorizationState = input<AuthorizationState>();

  @Output() preRequestScriptChange = new EventEmitter();
  @Output() preRequestEnabledChange = new EventEmitter();

  @Output() postRequestScriptChange = new EventEmitter();
  @Output() postRequestEnabledChange = new EventEmitter();

  @Output() sendRequest = new EventEmitter();
  @Output() queryChange = new EventEmitter<string>();
  @Output() variablesChange = new EventEmitter();
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() addFileVariableChange = new EventEmitter<{
    name: string;
    data: File[];
    isMultiple: boolean;
  }>();
  @Output() fileVariableNameChange = new EventEmitter();
  @Output() fileVariableIsMultipleChange = new EventEmitter();
  @Output() fileVariableDataChange = new EventEmitter();
  @Output() deleteFileVariableChange = new EventEmitter();
  @Output() queryEditorStateChange = new EventEmitter<QueryEditorState>();
  @Output() showTokenInDocsChange = new EventEmitter();

  @Output() authTypeChange = new EventEmitter<AuthorizationTypes>();
  @Output() authDataChange = new EventEmitter();

  // TODO: Add static: true
  @ViewChild('editor') editor: CodemirrorComponent | undefined;

  @HostBinding('style.flex-grow') public resizeFactor = 1;

  selectedIndex = 0;

  variableEditorHeight = '50%';

  readonly isAuthorizationEnabled = computed(() => {
    const state = this.authorizationState();
    return !!state && isAuthorizationEnabled(state);
  });

  // TODO: Antipattern, move to state
  // isAuthorizationEnabled = isAuthorizationEnabled;

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
  lineNumbersCompartment = new Compartment();

  editorExtensions: Extension[] = this.graphqlExtension();

  updateWidgetTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private gqlService: GqlService,
    private notifyService: NotifyService,
    private store: Store<RootState>,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const gqlSchema = this.gqlSchema();
    if (gqlSchema) {
      this.updateNewEditorTabSize(this.tabSize() || 2);
      this.updateNewEditorDisableLineNumber(this.disableLineNumbers());

      this.updateNewEditorSchema(gqlSchema);
      this.updateNewEditorVariableState(this.variables());
      this.updateNewEditorWindowId(this.windowId());
    }
  }

  ngAfterViewInit() {
    this.editorExtensions = this.graphqlExtension();

    this.updateNewEditorSchema(this.gqlSchema());
    this.updateNewEditorVariableState(this.variables());
    this.updateNewEditorWindowId(this.windowId());
    this.updateNewEditorTabSize(this.tabSize());
    this.updateNewEditorDisableLineNumber(this.disableLineNumbers());
  }

  ngOnChanges(changes: SimpleChanges) {
    // If there is a new schema, update the editor schema
    if (changes?.gqlSchema?.currentValue) {
      this.updateNewEditorSchema(changes.gqlSchema.currentValue);
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
      this.updateNewEditorTabSize(changes.tabSize.currentValue);
    }

    if (changes?.disableLineNumbers?.currentValue) {
      this.updateNewEditorDisableLineNumber(this.disableLineNumbers());
    }

    if (changes?.query?.currentValue && this.selectedIndex !== 0) {
      // Set current tab to Query if query is updated
      this.selectedIndex = 0;
    }

    if (changes?.shortcutMapping?.currentValue) {
      // Update the editor shortcuts based on the provided shortcuts
      this.updateEditorShortcuts(changes.shortcutMapping.currentValue);
    }

    if (changes?.variables?.currentValue && this.editor?.view) {
      this.updateNewEditorVariableState(changes.variables.currentValue);
    }

    if (changes?.windowId?.currentValue && this.editor?.view) {
      this.updateNewEditorWindowId(changes.windowId.currentValue);
    }

    if (changes?.betaDisableNewEditor) {
      // Using timeout to wait for editor to be initialized.
      // This is hacky but should be fine since the beta should be temporary
      setTimeout(() => {
        if (this.editor?.view) {
          this.updateNewEditorSchema(this.gqlSchema());
          this.updateNewEditorVariableState(this.variables());
          this.updateNewEditorWindowId(this.windowId());
          this.updateNewEditorTabSize(this.tabSize());
          this.updateNewEditorDisableLineNumber(this.disableLineNumbers());
        }
      }, 10);
    }
  }

  setTabSizeExtension(tabSize: number) {
    return [indentUnit.of(' '.repeat(tabSize)), EditorState.tabSize.of(tabSize)];
  }

  setLineNumbers(disableLineNumbers: boolean) {
    if (disableLineNumbers) {
      return [];
    } else {
      return lineNumbers();
    }
  }

  buildExtraKeysExtension(extraKeys?: Record<string, string>) {
    if (!extraKeys) {
      return [];
    }
    return keymap.of(
      Object.entries(extraKeys).map(([key, actionStr]) => {
        return {
          key,
          run: this.getCm6ShortcutFn(actionStr) ?? noOpCommand,
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

  onShowInDocsByReference(reference: TODO) {
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

  graphqlExtension() {
    return [
      ...getCodemirrorGraphqlExtensions({
        store: this.store,
        windowId: this.windowId(),
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
        onFillAllFields: (view, schema, query, cursor, _token) => {
          this.zone.run(() => {
            // the token from cm6-graphql is currently not working properly (offending PR https://github.com/graphql/graphiql/pull/3149).
            // so we generate the token from graphql-language-service ourselves with the right offset instead
            const token = getTokenAtPosition(query, cursor, 1);
            const updatedQuery = this.gqlService.fillAllFields(
              schema,
              query,
              cursor,
              token,
              {
                maxDepth: this.addQueryDepthLimit(),
              }
            );

            this.queryChange.next(updatedQuery.result);
            view.dispatch({
              selection: { anchor: posToOffset(view.state.doc, cursor) },
            });
          });
        },
        onRunActionClick: (operationType, operationName) => {
          this.zone.run(() => this.sendRequest.next({ operationName }));
        },
        onSelectFiles: (variableName, files, isMultiple) => {
          this.zone.run(() =>
            this.addFileVariableChange.emit({
              name: variableName,
              data: files,
              isMultiple,
            })
          );
        },
      }),
      this.tabSizeCompartment.of(this.setTabSizeExtension(this.tabSize())),
      this.extraKeysCompartment.of(this.buildExtraKeysExtension(this.extraKeys)),
      this.lineNumbersCompartment.of(this.setLineNumbers(this.disableLineNumbers())),
      this.editorStateListener(),
    ];
  }

  updateNewEditorSchema(schema?: GraphQLSchema) {
    if (schema && this.editor?.view) {
      debug.log('Updating schema for new editor...', schema);
      updateSchema(this.editor.view, schema);
    }
  }

  updateNewEditorWindowId(windowId: string) {
    if (this.editor?.view) {
      updateWindowId(this.editor.view, windowId);
    }
  }

  updateNewEditorVariableState(variables?: VariableState) {
    if (this.editor?.view) {
      updateGqlVariables(this.editor.view, variables);
    }
  }

  updateNewEditorTabSize(tabSize: number) {
    if (this.editor?.view) {
      this.editor.view.dispatch({
        effects: this.tabSizeCompartment.reconfigure(
          this.setTabSizeExtension(tabSize)
        ),
      });
    }
  }

  updateNewEditorDisableLineNumber(disableLineNumbers: boolean) {
    if (this.editor?.view) {
      this.editor.view.dispatch({
        effects: this.lineNumbersCompartment.reconfigure(
          this.setLineNumbers(disableLineNumbers)
        ),
      });
    }
  }

  getCm6ShortcutFn(actionName: string) {
    return this.cm6ActionToFn[actionName];
  }

  updateEditorShortcuts(extraKeys: Record<string, string>) {
    this.extraKeys = extraKeys;
    if (this.editor?.view) {
      this.editor.view.dispatch({
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
    const height = event.rectangle.height;

    if (height) {
      this.variableEditorHeight = `${height}px`;
    }
  }

  trackByIndex(index: number, f: FileVariable) {
    return index;
  }
}
