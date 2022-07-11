// import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup';
// import { graphql } from 'codemirror-graphql/cm6-legacy/mode';
import { EditorState, Text } from '@codemirror/state';
import { EditorView, lineNumbers, keymap } from '@codemirror/view';
import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
import { autocompletion, closeBrackets, CompletionContext, completionKeymap, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching, syntaxHighlighting, defaultHighlightStyle, syntaxTree } from '@codemirror/language';
import { linter } from '@codemirror/lint';
import query, { sdl } from './query';
import { graphql, graphqlLanguage } from 'altair-codemirror-graphql';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
import { buildSchema } from 'graphql';
import { getAutocompleteSuggestions, getDiagnostics } from 'graphql-language-service-interface';

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_@(]$/;
const schema = buildSchema(sdl);

const SEVERITY = ['error', 'warning', 'info'] as const;
const TYPE: any = {
  'GraphQL: Validation': 'validation',
  'GraphQL: Deprecation': 'deprecation',
  'GraphQL: Syntax': 'syntax',
};

const gqlSchemaCompletions = graphqlLanguage.data.of({
  autocomplete: (ctx: CompletionContext) => {
    const word = ctx.matchBefore(/\w*/);

    if (!AUTOCOMPLETE_CHARS.test(word.text.split('').pop()) && !ctx.explicit) {
      return null;
    }
    const val = ctx.state.doc.toString();
    const posVal = offsetToPos(ctx.state.doc, ctx.pos);
    const pos = new Position(posVal.line, posVal.ch)
    const results = getAutocompleteSuggestions(schema, val, pos);

    if (results.length === 0) {
      return null;
    }

    return {
      from: word.from,
      options: results.map(item => {
        return {
          label: item.label,
          // TODO:
          detail: item.detail || '',
          info: item.documentation || '',
          // TODO: create a getType function to transform kind into valid type
          // type: item.kind || '',
        };
      }),
    };
  },
})

const gqlSchemaLinter = linter((view) => {
  const results = getDiagnostics(view.state.doc.toString(), schema);

  return results.map(item => {
    if (!item.severity || !item.source) {
      return null;
    }

    return {
      from: posToOffset(view.state.doc, { line: item.range.start.line, ch: item.range.start.character }),
      to: posToOffset(view.state.doc, { line: item.range.end.line, ch: item.range.end.character-1 }),
      severity: SEVERITY[item.severity - 1],
      // source: item.source, // TODO:
      message: item.message,
      actions: [], // TODO: 
    }
  });
});

const gqlDocsJump = EditorView.domEventHandlers({
  click(evt, view) {
    // TODO: On mouse over, set decoration style
    // TODO: On mouse out, remove decoration style
    // TODO: using StateEffects
    // TODO: Set class on cm-editor when mod key is pressed
    // caret(Position|Range)FromPoint
    const currentPosition = view.state.selection.main.head;
    const nodeBefore = syntaxTree(view.state).resolveInner(currentPosition, -1);
    console.log(evt, view, currentPosition, nodeBefore);
  },
});

// console.log(graphql(), html(), json(), python());
const state = EditorState.create({
  doc: query,
  extensions: [
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...completionKeymap,
      ...closeBracketsKeymap,
      indentWithTab,
    ]),
    bracketMatching(),
    closeBrackets(),
    history(),
    autocompletion(),
    lineNumbers(),
    // json(),
    // html(),
    // python(),
    graphql(),
    syntaxHighlighting(oneDarkHighlightStyle),
    gqlSchemaCompletions,
    gqlSchemaLinter,
    gqlDocsJump,
  ],
});

new EditorView({
  state,
  parent: document.querySelector('#editor')!,
});

// Hot Module Replacement
if ((module as any).hot) {
  (module as any).hot.accept();
}

function posToOffset(doc: Text, pos: CM5Pos) {
  return doc.line(pos.line + 1).from + pos.ch
}
function offsetToPos(doc: Text, offset: number): CM5Pos {
  let line = doc.lineAt(offset)
  return {line: line.number - 1, ch: offset - line.from}
}

interface CM5Pos {
  line: number;
  ch: number;
}

interface IPosition {
  line: number;
  character: number;
  setLine(line: number): void;
  setCharacter(character: number): void;
  lessThanOrEqualTo(position: IPosition): boolean;
}

class Position implements IPosition {
  constructor(public line: number, public character: number) {}

  setLine(line: number) {
    this.line = line;
  }

  setCharacter(character: number) {
    this.character = character;
  }

  lessThanOrEqualTo(position: IPosition) {
    return this.line < position.line ||
    (this.line === position.line && this.character <= position.character);
  }
}