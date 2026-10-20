import { Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import {
  graphql,
  fillAllFieldsCommands,
  showInDocsCommand,
  graphqlLanguage,
} from 'cm6-graphql';
import { getNamedType, GraphQLSchema, GraphQLType } from 'graphql';
import { ContextToken } from 'graphql-language-service';
import { CompletionItem } from 'graphql-language-service-types';
import { Position } from '../../utils/editor/helpers';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { debug } from '../../utils/logger';
import { getRunActionPlugin, RunActionWidgetOptions } from './run-widget';
import { CompletionContext } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import {
  getUploadActionPlugin,
  UploadActionWidgetOptions,
  gqlVariablesStateField,
  windowIdStateField,
} from './upload-widget';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

export interface ExtensionsOptions {
  store: Store<RootState>;
  windowId: string;
  onShowInDocs?: (field?: string, type?: string, parentType?: string) => void;
  onFillAllFields?: (
    view: EditorView,
    schema: GraphQLSchema,
    query: string,
    cursor: Position,
    token: ContextToken
  ) => void;
  onRunActionClick?: RunActionWidgetOptions['onClick'];
  onSelectFiles?: UploadActionWidgetOptions['onSelectFiles'];
}

const noOp = () => {};

export const getCodemirrorGraphqlExtensions = (opts: ExtensionsOptions) => {
  const extensions = [
    graphql(undefined, {
      onShowInDocs: opts?.onShowInDocs,
      onCompletionInfoRender: (completionItem, ctx, _item) => {
        const description = getDescriptionFromContext(completionItem);
        const deprecation = completionItem.isDeprecated
          ? completionItem.deprecationReason
          : '';

        if (description || deprecation) {
          const el = document.createElement('div');
          if (description) {
            const descriptionEl = document.createElement('div');
            descriptionEl.classList.add('cm-gqlCompletionDescription');

            if (completionItem.type) {
              const typeEl = document.createElement('div');
              typeEl.classList.add('cm-gqlCompletionDescriptionType');
              typeEl.innerHTML = `<span class="cm-gqlCompletionDescriptionTypeContent">${sanitizeHtml(
                completionItem.type.inspect()
              )}</span>`;
              typeEl.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (opts?.onShowInDocs) {
                  opts.onShowInDocs(
                    undefined,
                    getMaybeNamedType(completionItem.type)?.name
                  );
                }
              });

              descriptionEl.appendChild(typeEl);
            }

            const descriptionContentEl = document.createElement('div');
            descriptionContentEl.classList.add('cm-gqlCompletionDescriptionContent');
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

        return null;
      },
      onFillAllFields: opts?.onFillAllFields,
    }),
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
      ])
    ),
    getRunActionPlugin(opts?.onRunActionClick || noOp),
    getUploadActionPlugin(opts?.onSelectFiles || noOp, opts?.windowId, opts?.store),
    gqlVariablesStateField,
    windowIdStateField,
    graphqlLanguage.data.of({
      autocomplete: (context: CompletionContext) => {
        const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

        // Show if inside a field SelectionSet
        if (
          nodeBefore.name === 'SelectionSet' &&
          nodeBefore.parent?.name === 'Field'
        ) {
          return {
            from: context.pos,
            options: [
              {
                label: 'Fill all fields',
                apply(view: EditorView) {
                  fillAllFieldsCommands(view);
                },
                boost: 99,
                type: 'function',
                info: 'Automatically fill in all the fields here. Optionally generates nested fields as well (controlled by addQueryDepthLimit in settings)',
              },
            ],
          };
        }

        // Show if inside an argument ObjectValue (input object type)
        if (
          nodeBefore.name === 'ObjectValue' ||
          (nodeBefore.name === '{' && nodeBefore.parent?.name === 'ObjectValue')
        ) {
          return {
            from: context.pos,
            options: [
              {
                label: 'Fill all fields',
                apply(view: EditorView) {
                  fillAllFieldsCommands(view);
                },
                boost: 99,
                type: 'function',
                info: 'Automatically fill in all the fields for this input object argument (controlled by addQueryDepthLimit in settings)',
              },
            ],
          };
        }

        return null;
      },
    }),
  ];

  return extensions;
};

export const noOpCommand = () => {
  debug.log('no op');
  return true;
};

const getDescriptionFromContext = (ctx: CompletionItem) => {
  const maxDescriptionLength = 150;

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
  ) as string;
};

const getMaybeNamedType = (type?: GraphQLType) => {
  if (type) {
    return getNamedType(type);
  }
};
