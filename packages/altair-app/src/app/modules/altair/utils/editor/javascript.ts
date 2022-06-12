import { CompletionContext } from '@codemirror/autocomplete';
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
  let options = []
  for (let name in object) {
    options.push({
      label: name,
      type: typeof object[name] === 'function' ? 'function' : 'variable',
    })
  }

  return {
    from,
    options,
    validFor: /^[\w$]*$/
  }
}

export const getGlobalScopeAutocompletion = (globalObj: any = window) => {
  return (context: CompletionContext) => {
    const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  
    if (completePropertyAfter.includes(nodeBefore.name) && nodeBefore.parent?.name == 'MemberExpression') {
      let object = nodeBefore.parent.getChild('Expression');
      if (object?.name === 'VariableName') {
        let from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from
        let variableName = context.state.sliceDoc(object.from, object.to)
        if (typeof (globalObj as any)[variableName] === 'object') {
          return completeProperties(from, (globalObj as any)[variableName]);
        }
      }
    } else if (nodeBefore.name === 'VariableName') {
      return completeProperties(nodeBefore.from, globalObj);
    } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
      return completeProperties(context.pos, globalObj);
    }
  
    return null;
  }
};
