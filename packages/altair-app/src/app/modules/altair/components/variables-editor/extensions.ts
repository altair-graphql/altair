import {
  Completion,
  CompletionContext,
  CompletionResult,
} from '@codemirror/autocomplete';
import { json, jsonLanguage } from '@codemirror/lang-json';
import { syntaxTree } from '@codemirror/language';
import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { IDictionary } from 'altair-graphql-core/build/types/shared';
import { GraphQLInputObjectType, GraphQLInputType } from 'graphql';

const variableToTypeEffect =
  StateEffect.define<IDictionary<GraphQLInputType> | undefined>();
const variableToTypeStateField = StateField.define<
  IDictionary<GraphQLInputType> | undefined
>({
  create() {
    return undefined;
  },
  update(variableToType, tr) {
    for (const e of tr.effects) {
      if (e.is(variableToTypeEffect)) {
        return e.value;
      }
    }

    return variableToType;
  },
});
export const updateVariableToType = (
  view: EditorView,
  variableToType?: IDictionary
) => {
  view.dispatch({
    effects: variableToTypeEffect.of(variableToType),
  });
};
export const getVariableToType = (state: EditorState) => {
  return state.field(variableToTypeStateField);
};

export const gqlVariables = () => {
  return [
    json(),
    jsonLanguage.data.of({
      autocomplete: (ctx: CompletionContext): CompletionResult | null => {
        const nodeBefore = syntaxTree(ctx.state).resolveInner(ctx.pos, -1);
        const variableToType = getVariableToType(ctx.state);
        let curNode = nodeBefore;
        const nodeNames = [{ type: curNode.name, name: '' }];
        while (curNode.parent) {
          let propertyName = '';
          const propertyNameNode = curNode.parent.getChild('PropertyName');
          if (propertyNameNode) {
            propertyName = ctx.state.doc.sliceString(
              propertyNameNode.from,
              propertyNameNode.to
            );
          }
          nodeNames.push({
            type: curNode.parent.name,
            // trim quotes around string, since JSON property name is always quoted
            name: propertyName.replace(/(^['"]|['"]$)/g, ''),
          });
          curNode = curNode.parent;
        }

        if (nodeNames[0]?.type === 'JsonText') {
          if (ctx.explicit) {
            return {
              from: ctx.pos,
              to: ctx.pos,
              options: [
                {
                  label: '{',
                },
              ],
            };
          }
        }

        if (!variableToType) {
          return null;
        }

        // const curField = '';
        // const curType = undefined;
        let dataSource = variableToType;
        nodeNames.reverse().forEach((nodeName) => {
          switch (nodeName.type) {
            case 'JsonText':
              dataSource = variableToType;
              return;
            case 'Object':
              return;
            case 'Property':
              const propName = nodeName.name;
              if (!propName) {
                return;
              }
              const curType = dataSource[propName];
              if (!curType) {
                dataSource = {};
                return;
              }

              dataSource = typeToVTT(curType);
              return;
          }
        });

        // TODO: Top level object?
        // TODO: Handle nested types
        // TODO: Refactor to a "getHints" function
        if (nodeBefore.name === 'Object') {
          const variableNames = Object.keys(dataSource);
          return {
            from: ctx.pos,
            options: variableNames.map((name): Completion => {
              return {
                label: `"${name}": `,
                detail: dataSource[name]?.toString(),
              };
            }),
          };
        }
        if (nodeBefore.name === 'PropertyName') {
          const variableNames = Object.keys(dataSource);
          return {
            from: ctx.pos,
            options: variableNames.map((name): Completion => {
              return {
                label: name,
                detail: dataSource[name]?.toString(),
              };
            }),
          };
        }

        return null;
      },
    }),
    variableToTypeStateField,
  ];
};

const typeToVTT = (type: GraphQLInputType) => {
  // TODO: Handle other type instances
  if (type instanceof GraphQLInputObjectType) {
    return Object.entries(type.getFields()).reduce(
      (acc, [k, v]) => ({ ...acc, [k]: v.type }),
      {} as IDictionary<GraphQLInputType>
    );
  }

  return {};
};
