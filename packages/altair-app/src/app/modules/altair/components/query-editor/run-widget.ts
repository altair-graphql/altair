import { syntaxTree } from '@codemirror/language';
import { EditorState, Range, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, WidgetType } from '@codemirror/view';
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
    wrap.innerHTML = sanitizeHtml(
      `&#9658; (Send ${this.opts.operationType}${
        this.opts.operationName ? ` ${this.opts.operationName}` : ''
      })`
    );
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
  state: EditorState,
  onClick: RunActionWidgetOptions['onClick']
) => {
  const widgets: Range<Decoration>[] = [];

  syntaxTree(state).iterate({
    enter: (node) => {
      if (node.name === 'OperationDefinition') {
        let operationName = '';
        const operationTypeNode = node.node.getChild('OperationType');
        if (!operationTypeNode) {
          return;
        }
        const operationType = state.doc.sliceString(
          operationTypeNode.from,
          operationTypeNode.to
        );
        const nameNode = node.node.getChild('Name');
        if (nameNode) {
          operationName = state.doc.sliceString(nameNode.from, nameNode.to);
        }
        const deco = Decoration.widget({
          widget: new RunActionWidget({
            operationName,
            operationType,
            onClick,
          }),
          side: -1,
          block: true,
        });

        widgets.push(deco.range(node.from));
      }
    },
  });

  return Decoration.set(widgets);
};

export const getRunActionPlugin = (onClick: RunActionWidgetOptions['onClick']) => {
  return StateField.define<DecorationSet>({
    create(state) {
      return runActions(state, onClick);
    },
    update(decorations, transaction) {
      if (transaction.docChanged) {
        return runActions(transaction.state, onClick);
      }

      return decorations.map(transaction.changes);
    },
    provide(field) {
      return EditorView.decorations.from(field);
    },
  });
};
