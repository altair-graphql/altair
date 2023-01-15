import {
  WidgetType,
  EditorView,
  Decoration,
  ViewUpdate,
  ViewPlugin,
  DecorationSet,
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { EditorState, Range, StateEffect, StateField } from '@codemirror/state';
import { getSchema } from 'cm6-graphql';
import { cleanTypeName } from '../../services/gql/helpers';
import { GraphQLScalarType } from 'graphql';
import {
  FileVariable,
  VariableState,
} from 'altair-graphql-core/build/types/state/variable.interfaces';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UploadActionWidgetOptions {
  variableName: string;
  isMultiple: boolean;
  files: File[];
  onSelectFiles: (
    variableName: string,
    files: File[],
    isMultiple: boolean
  ) => void;
}
class UploadWidget extends WidgetType {
  constructor(readonly opts: UploadActionWidgetOptions) {
    super();
  }

  eq(other: UploadWidget) {
    return (
      other.opts.variableName == this.opts.variableName &&
      other.opts.files === this.opts.files
    );
  }

  toDOM() {
    const wrap = document.createElement('span');
    wrap.className = 'query-editor__inline-widget';

    const button = wrap.appendChild(document.createElement('button'));
    button.classList.add('query-editor__upload-action');
    button.title = 'Select files..';
    const ellipsis = `&#183;&#183;&#183;`;
    button.innerHTML = ellipsis;
    const noOfFiles = this.opts.files.length;
    if (noOfFiles) {
      button.classList.add('query-editor__upload-action--selected');
      button.innerHTML = `${noOfFiles} ${ellipsis}`;
      button.title = `${noOfFiles} files selected`;
    }

    const fileInput = wrap.appendChild(document.createElement('input'));
    fileInput.type = 'file';
    fileInput.multiple = this.opts.isMultiple;
    fileInput.style.display = 'none';
    fileInput.style.width = '0.1px';
    fileInput.style.height = '0.1px';
    fileInput.style.opacity = '0';
    fileInput.style.overflow = 'hidden';
    fileInput.style.position = 'absolute';
    fileInput.style.zIndex = '-1';

    fileInput.addEventListener('change', () => {
      if (!fileInput.files) {
        return;
      }
      this.opts.onSelectFiles(
        this.opts.variableName,
        Array.from(fileInput.files),
        this.opts.isMultiple
      );
    });

    button.addEventListener('click', () => {
      fileInput.click();
    });

    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

const uploadActionDecorations = (
  view: EditorView,
  onSelectFiles: UploadActionWidgetOptions['onSelectFiles'],
  fileVariabless?: FileVariable[]
) => {
  const schema = getSchema(view.state);
  const fileVariables =
    fileVariabless || getGqlVariables(view.state)?.files || [];
  if (!schema) {
    return Decoration.none;
  }
  const widgets: Range<Decoration>[] = [];
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name === 'VariableDefinition') {
          const variableNameNode = node.node.getChild('Variable');
          if (!variableNameNode) {
            return;
          }
          const extractedVariableName = view.state.doc.sliceString(
            variableNameNode.from,
            variableNameNode.to
          );
          const cleanedVariableName = extractedVariableName.replace(/^\$/, '');
          const typeNode =
            node.node.getChild('NamedType') ??
            node.node.getChild('ListType') ??
            node.node.getChild('NonNullType');
          if (!typeNode) {
            return;
          }
          const extractedTypeName = view.state.doc.sliceString(
            typeNode.from,
            typeNode.to
          );
          const cleanedTypeName = cleanTypeName(extractedTypeName);
          const type = schema.getType(cleanedTypeName);
          // verify that this is the expected Upload type
          if (
            type &&
            type instanceof GraphQLScalarType &&
            type.name === 'Upload'
          ) {
            const existingData = fileVariables.find(
              (f) => f.name === cleanedVariableName
            )?.data;

            const deco = Decoration.widget({
              widget: new UploadWidget({
                variableName: cleanedVariableName,
                isMultiple: /\[.+\]/.test(extractedTypeName), // list type - e.g. [Type]
                files: Array.isArray(existingData) ? existingData : [],
                onSelectFiles,
              }),
              side: 1,
            });
            widgets.push(deco.range(typeNode.to));
          }
        }
      },
    });
  }
  return Decoration.set(widgets);
};

export const getUploadActionPlugin = (
  onSelectFiles: UploadActionWidgetOptions['onSelectFiles'],
  windowId: string,
  store: Store<RootState>
) => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      unsubscribe: Subscription;

      constructor(view: EditorView) {
        this.decorations = uploadActionDecorations(view, onSelectFiles);
        this.unsubscribe = store
          .select((state) => state.windows[getWindowId(view.state)])
          .pipe(
            tap((window) => {
              const fileVariables = window?.variables.files;
              if (fileVariables) {
                this.decorations = uploadActionDecorations(
                  view,
                  onSelectFiles,
                  fileVariables
                );
              }
            })
          )
          .subscribe();
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          this.decorations = uploadActionDecorations(
            update.view,
            onSelectFiles
          );
      }

      destroy() {
        this.unsubscribe.unsubscribe();
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
};

const gqlVariablesEffect = StateEffect.define<VariableState | undefined>();
export const gqlVariablesStateField = StateField.define<
  VariableState | undefined
>({
  create() {
    return undefined;
  },
  update(opts, tr) {
    for (const e of tr.effects) {
      if (e.is(gqlVariablesEffect)) {
        return e.value;
      }
    }

    return opts;
  },
});
export const updateGqlVariables = (
  view: EditorView,
  variables?: VariableState
) => {
  view.dispatch({
    effects: gqlVariablesEffect.of(variables),
  });
};
export const getGqlVariables = (state: EditorState) => {
  return state.field(gqlVariablesStateField);
};

const windowIdEffect = StateEffect.define<string>();
export const windowIdStateField = StateField.define<string>({
  create() {
    return '';
  },
  update(opts, tr) {
    for (const e of tr.effects) {
      if (e.is(windowIdEffect)) {
        return e.value;
      }
    }

    return opts;
  },
});
export const updateWindowId = (view: EditorView, windowId = '') => {
  view.dispatch({
    effects: windowIdEffect.of(windowId),
  });
};
export const getWindowId = (state: EditorState) => {
  return state.field(windowIdStateField);
};
