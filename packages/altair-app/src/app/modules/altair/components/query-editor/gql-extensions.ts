import {
  EditorState,
  Text,
  Compartment,
  Prec,
  StateField,
  Annotation,
  StateEffect,
} from '@codemirror/state';
import { EditorView, lineNumbers, keymap, Command } from '@codemirror/view';
import {
  history,
  defaultKeymap,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {
  autocompletion,
  closeBrackets,
  CompletionContext,
  completionKeymap,
  closeBracketsKeymap,
  Completion,
} from '@codemirror/autocomplete';
import {
  bracketMatching,
  syntaxHighlighting,
  defaultHighlightStyle,
  syntaxTree,
} from '@codemirror/language';
import { Diagnostic, linter } from '@codemirror/lint';
import { graphql, graphqlLanguage } from 'altair-codemirror-graphql';
import { buildSchema, getNamedType, GraphQLSchema, GraphQLType } from 'graphql';
import {
  getAutocompleteSuggestions,
  getDiagnostics,
  getTokenAtPosition,
  getTypeInfo,
} from 'graphql-language-service-interface';
import { ContextToken } from 'graphql-language-service-parser';
import { CompletionItem } from 'graphql-language-service-types';
import { fillAllFields } from '../../services/gql/fillFields';
import { Token } from 'codemirror';
import { offsetToPos, Position, posToOffset } from '../../utils/editor/helpers';
import marked from 'marked';
import sanitizeHtml from 'sanitize-html';
import { on } from '../../utils/events';
import { debug } from '../../utils/logger';
import { getRunActionPlugin, RunActionWidgetOptions } from './run-widget';

export interface GqlExtensionsOptions {
  onShowInDocs?: (field?: string, type?: string, parentType?: string) => void;
  onFillAllFields?: (
    view: EditorView,
    schema: GraphQLSchema,
    query: string,
    cursor: Position,
    token: ContextToken
  ) => void;
  onRunActionClick?: RunActionWidgetOptions['onClick'];
}

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_@(]$/;

const SEVERITY = ['error', 'warning', 'info'] as const;
const TYPE: any = {
  'GraphQL: Validation': 'validation',
  'GraphQL: Deprecation': 'deprecation',
  'GraphQL: Syntax': 'syntax',
};

const getGqlCompletions = (opts?: GqlExtensionsOptions) => {
  return graphqlLanguage.data.of({
    autocomplete: (ctx: CompletionContext) => {
      const schema = getSchema(ctx.state);
      if (!schema) {
        return null;
      }

      const word = ctx.matchBefore(/\w*/);

      if (!word) {
        return null;
      }

      const lastWordChar = word.text.split('').pop()!;
      if (!AUTOCOMPLETE_CHARS.test(lastWordChar) && !ctx.explicit) {
        return null;
      }
      const val = ctx.state.doc.toString();
      const pos = offsetToPos(ctx.state.doc, ctx.pos);
      const results = getAutocompleteSuggestions(schema, val, pos);

      if (results.length === 0) {
        return null;
      }

      return {
        from: word.from,
        options: results.map((item) => {
          return {
            label: item.label,
            // TODO:
            detail: item.detail || '',
            info: (completion: Completion) => {
              const description = getDescriptionFromContext(item);
              const deprecation = item.isDeprecated
                ? item.deprecationReason
                : '';

              if (description || deprecation) {
                const el = document.createElement('div');
                if (description) {
                  const descriptionEl = document.createElement('div');
                  descriptionEl.classList.add('cm-gqlCompletionDescription');

                  if (item.type) {
                    const typeEl = document.createElement('div');
                    typeEl.classList.add('cm-gqlCompletionDescriptionType');
                    typeEl.innerHTML = `<span class="cm-gqlCompletionDescriptionTypeContent">${sanitizeHtml(
                      item.type.inspect()
                    )}</span>`;
                    typeEl.addEventListener('mousedown', (e) => {
                      e.preventDefault();
                      if (opts?.onShowInDocs) {
                        opts.onShowInDocs(
                          undefined,
                          getMaybeNamedType(item.type)?.name
                        );
                      }
                    });

                    descriptionEl.appendChild(typeEl);
                  }

                  const descriptionContentEl = document.createElement('div');
                  descriptionContentEl.classList.add(
                    'cm-gqlCompletionDescriptionContent'
                  );
                  descriptionContentEl.innerHTML = sanitizeHtml(description);

                  descriptionEl.appendChild(descriptionContentEl);

                  el.appendChild(descriptionEl);
                }

                if (deprecation) {
                  const deprecationEl = document.createElement('div');
                  deprecationEl.classList.add('cm-gqlCompletionDeprecation');
                  deprecationEl.innerHTML = `<span class="cm-gqlCompletionDeprecationTag">Deprecated</span> ${sanitizeHtml(
                    deprecation
                  )}`;

                  el.appendChild(deprecationEl);
                }

                return el;
              }
            },
            // TODO: create a getType function to transform kind into valid type
            // type: item.kind || '',
          };
        }),
      };
    },
  });
};

const getGqlLinter = () => {
  return linter((view) => {
    const schema = getSchema(view.state);
    if (!schema) {
      return [];
    }
    const results = getDiagnostics(view.state.doc.toString(), schema);

    return results
      .map((item): Diagnostic | null => {
        if (!item.severity || !item.source) {
          return null;
        }

        return {
          from: posToOffset(
            view.state.doc,
            new Position(item.range.start.line, item.range.start.character)
          ),
          to: posToOffset(
            view.state.doc,
            new Position(item.range.end.line, item.range.end.character - 1)
          ),
          severity: SEVERITY[item.severity - 1],
          // source: item.source, // TODO:
          message: item.message,
          actions: [], // TODO:
        };
      })
      .filter((_): _ is Diagnostic => !!_);
  });
};

const getGqlJumpTo = (opts?: GqlExtensionsOptions) => {
  return EditorView.domEventHandlers({
    click(evt, view) {
      const schema = getSchema(view.state);
      if (!schema) {
        return;
      }
      // TODO: On mouse over, set decoration style
      // TODO: On mouse out, remove decoration style
      // TODO: using StateEffects
      // TODO: Set class on cm-editor when mod key is pressed
      const currentPosition = view.state.selection.main.head;
      const pos = offsetToPos(view.state.doc, currentPosition);
      const token = getTokenAtPosition(view.state.doc.toString(), pos);
      const tInfo = getTypeInfo(schema, token.state);

      if (opts?.onShowInDocs && isMetaKeyPressed(evt)) {
        opts.onShowInDocs(
          tInfo.fieldDef?.name,
          tInfo.type?.inspect(),
          tInfo.parentType?.inspect()
        );
      }
    },
  });
};

const schemaEffect = StateEffect.define<GraphQLSchema | undefined>();
const schemaStateField = StateField.define<GraphQLSchema | undefined>({
  create() {
    return undefined;
  },
  update(schema, tr) {
    for (let e of tr.effects) {
      if (e.is(schemaEffect)) {
        return e.value;
      }
    }

    return schema;
  },
});

const optionsEffect = StateEffect.define<GqlExtensionsOptions | undefined>();
const optionsStateField = StateField.define<GqlExtensionsOptions | undefined>({
  create() {
    return undefined;
  },
  update(opts, tr) {
    for (let e of tr.effects) {
      if (e.is(optionsEffect)) {
        return e.value;
      }
    }

    return opts;
  },
});
export const updateSchema = (view: EditorView, schema?: GraphQLSchema) => {
  view.dispatch({
    effects: schemaEffect.of(schema),
  });
};
const getSchema = (state: EditorState) => {
  return state.field(schemaStateField);
};
const getOpts = (state: EditorState) => {
  return state.field(optionsStateField);
};

const noOp = () => {};
export const getCodemirrorGraphqlExtensions = (opts?: GqlExtensionsOptions) => {
  const extensions = [
    graphql(),
    Prec.high(
      keymap.of([
        {
          key: 'Shift-Ctrl-Enter',
          run: fillAllFieldsCommands,
        },
        {
          // NOTE: shortcut key is case sensitive
          key: 'Ctrl-d',
          run: showInDocsCommand,
        },
        {
          key: 'Cmd-Enter',
          run: noOpCommand,
        },
      ])
    ),
    getGqlCompletions(opts),
    getGqlLinter(),
    getGqlJumpTo(opts),
    schemaStateField,
    getRunActionPlugin(opts?.onRunActionClick || noOp),
  ];

  return extensions;
};

export const noOpCommand = () => {
  debug.log('no op');
  return true;
};

export const fillAllFieldsCommands = (view: EditorView) => {
  const schema = getSchema(view.state);
  if (!schema) {
    return true;
  }
  const opts = getOpts(view.state);
  const currentPosition = view.state.selection.main.head;
  const pos = offsetToPos(view.state.doc, currentPosition);
  const token = getTokenAtPosition(view.state.doc.toString(), pos);

  if (schema && opts?.onFillAllFields) {
    opts.onFillAllFields(view, schema, view.state.doc.toString(), pos, token);
  }

  return true;
};
export const showInDocsCommand = (view: EditorView) => {
  const schema = getSchema(view.state);
  if (!schema) {
    return true;
  }
  const opts = getOpts(view.state);
  const currentPosition = view.state.selection.main.head;
  const pos = offsetToPos(view.state.doc, currentPosition);
  const token = getTokenAtPosition(view.state.doc.toString(), pos);
  if (schema && opts?.onShowInDocs) {
    const tInfo = getTypeInfo(schema, token.state);
    opts.onShowInDocs(
      tInfo.fieldDef?.name,
      tInfo.type?.inspect(),
      tInfo.parentType?.inspect()
    );
  }
  return true;
};

const isMac = () => /mac/i.test(navigator.platform);
const isMetaKeyPressed = (e: MouseEvent) => (isMac() ? e.metaKey : e.ctrlKey);

const getDescriptionFromContext = (ctx: CompletionItem) => {
  const maxDescriptionLength = 70;

  let description = 'Self descriptive.';
  let appendEllipsis = false;

  if (ctx.documentation) {
    description = ctx.documentation;
  }
  const type = getMaybeNamedType(ctx.type);
  if (type?.description) {
    description = type.description;
  }

  if (description.length > maxDescriptionLength) {
    appendEllipsis = true;
  }

  return marked(
    `${description}`.substring(0, maxDescriptionLength) +
      (appendEllipsis ? '...' : '')
  );
};

const getMaybeNamedType = (type?: GraphQLType) => {
  if (type) {
    return getNamedType(type);
  }
};
