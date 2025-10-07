import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  KeyValueDiffers,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorState, Extension, Prec, StateEffect } from '@codemirror/state';
import {
  drawSelection,
  EditorView,
  keymap,
  lineNumbers,
  tooltips,
  ViewUpdate,
} from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import { searchKeymap, search } from '@codemirror/search';
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import {
  syntaxHighlighting,
  HighlightStyle,
  foldGutter,
  bracketMatching,
  foldKeymap,
} from '@codemirror/language';

import { tags as t } from '@lezer/highlight';
import { InternalEditorError } from '../../utils/errors';
import { debug } from '../../utils/logger';
import { AltairConfig } from 'altair-graphql-core/build/config';

@Component({
  selector: 'app-codemirror',
  templateUrl: './codemirror.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodemirrorComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CodemirrorComponent
  implements AfterViewInit, OnChanges, ControlValueAccessor, OnDestroy
{
  @Input() extensions: Extension[] = [];
  @Input() @HostBinding('class.cm6-full-height') fullHeight = false;
  @Input() showLineNumber = true;
  @Input() foldGutter = true;
  @Input() wrapLines = true;
  @Input() redrawLayout = false;

  // Specifies the editor should not have any default extensions
  @Input() bare = false;

  @Output() focusChange = new EventEmitter<boolean>();

  @ViewChild('ref') ref!: ElementRef<HTMLTextAreaElement>;

  view?: EditorView;
  private innerValue = '';
  private onTouched = () => {};
  private onChange = (s: string) => {};

  constructor(
    private zone: NgZone,
    private altairConfig: AltairConfig
  ) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const startState = EditorState.create({
        doc: this.value,
        extensions: this.getExtensions(),
      });

      this.view = new EditorView({
        state: startState,
        parent: this.ref.nativeElement,
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.view && changes.extensions?.currentValue) {
      this.view.dispatch({
        effects: StateEffect.reconfigure.of(
          Prec.high(this.getExtensions(changes.extensions.currentValue))
        ),
      });
    }

    if (changes.redrawLayout?.currentValue) {
      // wait for animations to finish
      setTimeout(() => {
        if (this.view) {
          this.view.dispatch({
            changes: {
              from: 0,
              to: this.view.state.doc.length,
              insert: this.view.state.doc.sliceString(0),
            },
          });
        }
      }, 250);
    }
  }

  ngOnDestroy() {
    this.view?.destroy();
  }

  // get accessor
  get value() {
    return this.innerValue;
  }

  @Input()
  // set accessor including call the onchange callback
  set value(v: string) {
    this.writeValue(v);
  }

  writeValue(value: string) {
    if (value === this.innerValue) {
      return;
    }
    if (value === null || value === undefined) {
      return;
    }
    value = `${value}`;

    if (!this.view) {
      return;
    }

    const editorValue = this.view.state.doc.toString();

    if (editorValue !== value) {
      this.innerValue = value;
      this.view.dispatch({
        changes: { from: 0, to: this.view.state.doc.length, insert: value },
      });
    }
  }

  registerOnChange(fn: (s: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  codemirrorValueChanged(value: string) {
    if (this.innerValue !== value) {
      this.innerValue = value;
      this.onChange(value);
    }
  }

  focusChanged(focused: boolean) {
    this.onTouched();
    this.focusChange.emit(focused);
  }

  getExtensions(extraExtensions = this.extensions) {
    const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
      if (vu.docChanged) {
        const doc = vu.state.doc;
        const value = doc.toString();
        this.zone.run(() => this.codemirrorValueChanged(value));
      }
      if (vu.focusChanged) {
        this.zone.run(() => this.focusChanged(vu.view.hasFocus));
      }
    });
    const exceptionSink = EditorView.exceptionSink.of((exception) => {
      // throw new InternalEditorError(exception);
      throw exception;
    });
    const baseTheme = EditorView.theme({
      '&.cm-editor': {
        cursor: 'text',
      },
      '&.cm-editor.cm-focused': {
        outline: 'none',
      },
      '& .cm-tooltip': {
        background: 'var(--theme-bg-color)',
        border: '1px solid var(--theme-border-color)',
        borderRadius: '4px',
        fontSize: 'calc((var(--editor-font-size) / var(--baseline-size)) * 1rem)',

        '& > ul': {
          background: 'var(--theme-bg-color)',
          color: 'var(--theme-font-color)',
        },
      },
      '.cm-tooltip.cm-tooltip-autocomplete': {
        padding: '4px',

        '& > ul': {
          fontFamily: 'var(--editor-font-family)',
          whiteSpace: 'nowrap',
          overflow: 'hidden auto',
          maxWidth_fallback: '700px',
          maxWidth: 'min(700px, 95vw)',
          minWidth: '250px',
          maxHeight: '10em',
          listStyle: 'none',
          margin: 0,
          padding: 0,

          '& > li': {
            overflowX: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'pointer',
            padding: '2px 4px',
            lineHeight: 1.4,
          },
        },
      },

      '.cm-tooltip-autocomplete ul li': {
        background: 'var(--theme-bg-color)',
        color: 'var(--theme-font-color)',
        borderRadius: '4px',
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
      },

      '.cm-tooltip-autocomplete ul li[aria-selected]': {
        background: 'var(--primary-color)',
      },

      // '&dark .cm-tooltip-autocomplete ul li[aria-selected]': {
      //   background: '#347',
      //   color: 'white',
      // },

      '.cm-tooltip.cm-completionInfo': {
        position: 'absolute',
        padding: '4px',
        borderRadius: '4px',
        width: 'max-content',
        maxWidth: '400px',
        background: 'var(--theme-bg-color)',
        color: 'var(--theme-font-color)',
        lineHeight: '1.4',
        border: '1px solid var(--theme-border-color)',
        margin: '0 4px',
      },

      '.cm-completionInfo.cm-completionInfo-left': { right: '100%' },
      '.cm-completionInfo.cm-completionInfo-right': { left: '100%' },

      '.cm-completionIcon': {
        '&:empty': {
          display: 'none',
        },
      },
      // '.cm-completionLabel': {
      //   textAlign: 'left',
      // },
      // '.cm-completionDetail': {},

      // '&light .cm-snippetField': {backgroundColor: '#00000022'},
      // '&dark .cm-snippetField': {backgroundColor: '#ffffff22'},
      '.cm-snippetFieldPosition': {
        verticalAlign: 'text-top',
        width: 0,
        height: '1.15em',
        margin: '0 -0.7px -.7em',
        borderLeft: '1.4px dotted #888',
      },

      '.cm-completionMatchedText': {
        textDecoration: 'none',
        fontWeight: 'bold',
      },

      '.cm-panel-lint': {
        borderColor: 'red',
      },
      '.cm-tooltip-lint': {
        background: 'var(--theme-bg-color)',
        color: 'var(--theme-font-color)',
      },

      '.cm-gqlCompletionDescriptionTypeContent': {
        color: 'var(--primary-color)',
        background: 'rgba(var(--rgb-primary), .15)',
        cursor: 'pointer',
        padding: '3px',
        borderRadius: '2px',
        marginBottom: '5px',
      },
      '.cm-cursor': {
        borderColor: 'var(--theme-font-color)',
      },
    });
    // https://github.com/codemirror/theme-one-dark/blob/848ca1e82addf4892afc895e013754805af6182a/src/one-dark.ts#L96
    const defaultHighlightStyle = HighlightStyle.define([
      { tag: t.keyword, color: 'var(--editor-keyword-color)' },
      {
        tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: 'var(--editor-property-color)',
      },
      {
        tag: [
          t.function(t.variableName),
          t.special(t.variableName),
          t.variableName,
          t.labelName,
        ],
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
      {
        tag: [t.atom],
        color: 'var(--editor-atom-color)',
      },
      {
        tag: [t.processingInstruction, t.string, t.inserted],
        color: 'var(--editor-string-color)',
      },
    ]);

    const baseExtensions = [
      Prec.low(
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
          ...closeBracketsKeymap,
          ...searchKeymap,
          ...foldKeymap,
          indentWithTab,
        ])
      ),
      this.showLineNumber ? lineNumbers() : [], // TODO: Create own compartment
      this.foldGutter ? foldGutter() : [], // TODO: Create own compartment
      this.wrapLines ? EditorView.lineWrapping : [], // TODO: Create own compartment
      drawSelection(),
      EditorState.allowMultipleSelections.of(true),
      EditorView.cspNonce.of(this.altairConfig.cspNonce),
      bracketMatching(),
      closeBrackets(),
      history(),
      autocompletion(),
      search({
        top: true,
      }),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      // tooltips({ parent: document.body }),
    ];

    return [
      updateListener,
      exceptionSink,
      Prec.highest(extraExtensions),
      // disable default behavior of used extension shortcuts
      Prec.high(
        keymap.of([
          {
            key: 'Cmd-Enter',
            run: noOpCommand,
          },
          {
            key: 'Ctrl-Enter',
            run: noOpCommand,
          },
          {
            key: 'Shift-Ctrl-p',
            run: noOpCommand,
          },
        ])
      ),
      !this.bare ? [...baseExtensions] : [],

      baseTheme,
    ];
  }
}

export const noOpCommand = () => {
  debug.log('no op');
  return true;
};
