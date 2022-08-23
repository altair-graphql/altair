import { syntaxTree } from '@codemirror/language';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from '@codemirror/view';
import sanitizeHtml from 'sanitize-html';

export interface RunActionWidgetOptions {
  operationType: string;
  operationName: string;
  onClick: (operationType: string, operationName: string) => void;
}

class RunActionWidget extends WidgetType {
  constructor(private opts: RunActionWidgetOptions) {
    super();
  }

  eq(other: RunActionWidget) {
    return (
      other.opts.operationName === this.opts.operationName &&
      other.opts.operationType === this.opts.operationType
    );
  }

  toDOM() {
    const wrap = document.createElement('div');
    wrap.innerHTML = sanitizeHtml(`&#9658; Run`);
    wrap.className = 'query-editor__line-widget';

    wrap.addEventListener('click', () =>
      this.opts.onClick(this.opts.operationType, this.opts.operationName)
    );

    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

const runActions = (
  view: EditorView,
  onClick: RunActionWidgetOptions['onClick']
) => {
  const widgets: Range<Decoration>[] = [];

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name === 'OperationDefinition') {
          let operationName = '';
          const operationTypeNode = node.node.getChild('OperationType');
          if (!operationTypeNode) {
            return;
          }
          const operationType = view.state.doc.sliceString(
            operationTypeNode.from,
            operationTypeNode.to
          );
          const nameNode = node.node.getChild('Name');
          if (nameNode) {
            operationName = view.state.doc.sliceString(
              nameNode.from,
              nameNode.to
            );
          }
          const deco = Decoration.widget({
            widget: new RunActionWidget({
              operationName,
              operationType,
              onClick,
            }),
            side: -1,
          });

          widgets.push(deco.range(node.from));
        }
      },
    });
  }

  return Decoration.set(widgets);
};

export const getRunActionPlugin = (
  onClick: RunActionWidgetOptions['onClick']
) => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = runActions(view, onClick);
      }

      update(vu: ViewUpdate) {
        if (vu.docChanged || vu.viewportChanged) {
          this.decorations = runActions(vu.view, onClick);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
      // eventHandlers: {
      //   mousedown: (e, view) => {
      //   },
      // },
    }
  );
};
