import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { getGlobalScopeAutocompletion } from './javascript';

const globalJavaScriptCompletions = javascriptLanguage.data.of({
  autocomplete: getGlobalScopeAutocompletion(),
});

export const baseJavascriptExtensions: Extension[] = [
  javascript(),
  globalJavaScriptCompletions,
];

export const getRequestScriptExtensions = (altairObj: any) => {
  const requestScriptTheme = EditorView.theme({
    '&': {
      backgroundColor: 'var(--theme-off-bg-color)',
      minHeight: '200px',
    },
  });
  const editorExtensions: Extension[] = [
    ...baseJavascriptExtensions,
    requestScriptTheme,
    javascriptLanguage.data.of({
      autocomplete: getGlobalScopeAutocompletion({
        // TODO: Figure out why altair.helpers does not show autocomplete
        // https://github.com/lezer-parser/javascript/blob/main/test/expression.txt
        // https://codemirror.net/examples/autocompletion/
        altair: altairObj,
      }),
    }),
  ];

  return editorExtensions;
};
