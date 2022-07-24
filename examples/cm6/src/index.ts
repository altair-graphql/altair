// import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup';
// import { graphql } from 'codemirror-graphql/cm6-legacy/mode';
import { EditorState, Text } from '@codemirror/state';
import { EditorView, lineNumbers, keymap } from '@codemirror/view';
import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
import { autocompletion, closeBrackets, CompletionContext, completionKeymap, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching, syntaxHighlighting, HighlightStyle, syntaxTree } from '@codemirror/language';
import { linter } from '@codemirror/lint';
import query, { sdl } from './query';
import { graphql, graphqlLanguage } from 'altair-codemirror-graphql';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
import { buildSchema } from 'graphql';
import { getAutocompleteSuggestions, getDiagnostics } from 'graphql-language-service-interface';
import { tags as t } from '@lezer/highlight';

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
const defaultHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--editor-keyword-color)' },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: 'var(--editor-property-color, red)',
  },
  {
    tag: [t.function(t.variableName), t.variableName, t.special(t.variableName), t.labelName],
    color: 'var(--editor-variable-color)',
  },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name), t.bool],
    color: 'var(--editor-builtin-color)',
  },
  {
    tag: [t.definition(t.name), t.separator],
    color: 'var(--editor-def-color)',
  },
  {
    tag: [
      t.typeName,
      t.className,
      t.number,
      t.changed,
      t.annotation,
      t.modifier,
      t.self,
      t.namespace,
    ],
    color: 'var(--editor-number-color)',
  },
  {
    tag: [
      t.operator,
      t.operatorKeyword,
      t.url,
      t.escape,
      t.regexp,
      t.link,
      t.special(t.string),
    ],
    color: 'var(--editor-keyword-color)',
  },
  { tag: [t.meta, t.comment], color: 'var(--editor-comment-color)' },
  {
    tag: [t.attributeName, t.attributeValue],
    color: 'var(--editor-attribute-color)',
  },
  { tag: [t.punctuation], color: 'var(--editor-punctuation-color)' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: [t.bool], color: 'var(--editor-builtin-color)' },
  {
    tag: [t.atom],
    color: 'var(--editor-atom-color)',
  },
  {
    tag: [t.processingInstruction, t.string, t.inserted],
    color: 'var(--editor-string-color)',
  },
]);

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
    // syntaxHighlighting(oneDarkHighlightStyle),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
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