import { CompletionContext, CompletionSource } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { IDictionary } from 'altair-graphql-core/build/types/shared';

const completePropertyAfter = ['PropertyName', '.', '?.'];
const dontCompleteIn = [
  'TemplateString',
  'LineComment',
  'BlockComment',
  'VariableDefinition',
  'PropertyDefinition',
];

const completeProperties = (from: number, object: IDictionary) => {
  const options = Object.entries(object).map(([name, val]) => {
    return {
      label: name,
      type: typeof val === 'function' ? 'function' : 'variable',
    };
  });

  return {
    from,
    options,
    validFor: /^[\w$]*$/,
  };
};

export const getGlobalScopeAutocompletion = (
  globalObj: IDictionary = window
): CompletionSource => {
  return (context: CompletionContext) => {
    const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

    if (
      completePropertyAfter.includes(nodeBefore.name) &&
      nodeBefore.parent?.name == 'MemberExpression'
    ) {
      const object = nodeBefore.parent.getChild('Expression');
      if (object?.name === 'VariableName') {
        const from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from;
        const variableName = context.state.sliceDoc(object.from, object.to);
        if (typeof globalObj[variableName] === 'object') {
          return completeProperties(from, globalObj[variableName]);
        }
      }
    } else if (nodeBefore.name === 'VariableName') {
      return completeProperties(nodeBefore.from, globalObj);
    } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
      return completeProperties(context.pos, globalObj);
    }

    return null;
  };
};
