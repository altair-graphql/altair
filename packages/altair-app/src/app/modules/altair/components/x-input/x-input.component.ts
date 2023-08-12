import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  autocompletion,
  CompletionContext,
  completionKeymap,
} from '@codemirror/autocomplete';
import {
  EditorState,
  Extension,
  StateEffect,
  StateField,
} from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  hoverTooltip,
  keymap,
  placeholder,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { Subscription } from 'rxjs';
import {
  EnvironmentService,
  IEnvironment,
} from '../../services/environment/environment.service';

const VariableRegex = /{{\s*([\w.]+)\s*}}/g;

@Component({
  selector: 'app-x-input',
  templateUrl: './x-input.component.html',
  styles: [],
  providers: [
    // Fixes 'no value accessor for form control with unspecified name attribute' error
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => XInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XInputComponent implements AfterViewInit, ControlValueAccessor {
  @Input() placeholder = '';
  @Output() blurChange = new EventEmitter();
  @Output() submitChange = new EventEmitter();

  extensions: Extension[] = [];

  ready = false;
  private innerValue = '';
  private activeEnvironment: IEnvironment = {};

  highlightEnvVariable =
    StateEffect.define<{
      from: number;
      to: number;
      value: string;
      found: boolean;
    }>();
  envHighlightTheme = EditorView.baseTheme({
    '.cm-env-var-highlight': { color: 'var(--red-color)', cursor: 'pointer' },
    '.cm-env-var-highlight--found': {
      color: 'var(--primary-color)',
      cursor: 'pointer',
    },
  });

  highlightField = this.getHighlightField();

  constructor(
    private store: Store<RootState>,
    private environmentService: EnvironmentService,
    private zone: NgZone
  ) {}
  ngAfterViewInit(): void {
    this.ready = true;
    this.extensions = this.getExtensions();
  }

  getExtensions() {
    const inputTheme = EditorView.theme({
      '&.cm-editor.cm-focused': {
        outline: 'none',
      },
      '&.cm-editor .cm-line': {
        fontFamily: 'var(--font-family)',
        cursor: 'text',
      },
      '.cm-scroller::-webkit-scrollbar': {
        display: 'none',
      },
      '.cm-tooltip-hover': {
        background: 'var(--theme-bg-color)',
        border: '1px solid var(--theme-border-color)',
        borderRadius: '4px',
        padding: '4px',
      },
      '.cm-tooltip-variable-value': {
        lineHeight: '1.2',
        color: 'var(--theme-font-color)',
        '& .cm-tooltip-arrow:before': {
          borderTopColor: 'var(--theme-bg-color)',
        },
        '& .cm-tooltip-arrow:after': {
          borderTopColor: 'transparent',
        },
      },
    });
    const filterNewLine = EditorState.transactionFilter.of((tr) => {
      return tr.newDoc.lines > 1 ? [] : [tr];
    });

    return [
      inputTheme,
      placeholder(this.placeholder),
      keymap.of([
        {
          key: 'Enter',
          run: () => {
            this.zone.run(() => this.submitChange.emit());
            return false;
          },
        },
        ...completionKeymap,
      ]),
      autocompletion({
        override: [
          (ctx: CompletionContext) => {
            const word = ctx.matchBefore(/{{\w*/);

            if (!word) {
              return null;
            }

            return {
              from: word.from,
              options: Object.keys(this.activeEnvironment).map((variable) => {
                return {
                  label: `{{${variable}}}`,
                  type: 'variable',
                  info: `Value: ${this.activeEnvironment[variable]}`,
                };
              }),
            };
          },
        ],
      }),
      ...this.getHighlightExtensions(),
      this.getTooltipExtensions(),
      filterNewLine,
    ];
  }

  getHighlightExtensions() {
    const self = this;
    const highlightListener = EditorView.updateListener.of((vu: ViewUpdate) => {
      if (vu.docChanged) {
        self.updateEnvVarHighlights(vu.view, this.activeEnvironment);
      }
    });

    const envStateSubscriber = ViewPlugin.fromClass(
      class {
        unsubscribe: Subscription;

        constructor(view: EditorView) {
          this.unsubscribe = self.store
            .select((state) => state.environments)
            .subscribe(() => {
              self.activeEnvironment =
                self.environmentService.getActiveEnvironment();
              self.updateEnvVarHighlights(view, self.activeEnvironment);
            });
        }

        destroy() {
          this.unsubscribe.unsubscribe();
        }
      }
    );

    return [highlightListener, envStateSubscriber, this.highlightField];
  }

  private getHighlightField() {
    const self = this;

    const envHighlightMark = Decoration.mark({ class: 'cm-env-var-highlight' });
    const envHighlightMarkFound = Decoration.mark({
      class: 'cm-env-var-highlight--found',
    });

    return StateField.define<DecorationSet>({
      create() {
        return Decoration.none;
      },
      update(highlights, tr) {
        highlights = highlights.map(tr.changes);
        for (const e of tr.effects)
          if (e.is(self.highlightEnvVariable)) {
            const from = e.value.from;
            const to = e.value.to;
            highlights = highlights.update({
              add: [
                e.value.found
                  ? envHighlightMarkFound.range(from, to)
                  : envHighlightMark.range(from, to),
              ],
            });
          }
        return highlights;
      },
      provide: (f) => EditorView.decorations.from(f),
    });
  }

  updateEnvVarHighlights(view: EditorView, activeEnvironment: IEnvironment) {
    const value = view.state.doc.toString();
    const effects: StateEffect<unknown>[] = this.getRanges(value)
      .filter((r) => r.from !== r.to)
      .map(({ from, to, value }) => {
        return this.highlightEnvVariable.of({
          from,
          to,
          value,
          found: value in activeEnvironment,
        });
      });

    if (!effects.length) {
      return;
    }

    if (view.state.field(this.highlightField, false)) {
      effects.push(
        StateEffect.appendConfig.of([
          this.highlightField,
          this.envHighlightTheme,
        ])
      );
    }

    view.dispatch({ effects: effects });
  }

  getTooltipExtensions() {
    const self = this;
    // https://codemirror.net/examples/tooltip/
    return hoverTooltip((view, pos, side) => {
      const { from, to, text } = view.state.doc.lineAt(pos);
      let start: number = pos;
      let end = pos;
      while (start > from && /\w/.test(text[start - from - 1] || '')) start--;
      while (end < to && /\w/.test(text[end - from] || '')) end++;
      if ((start == pos && side < 0) || (end == pos && side > 0)) {
        return null;
      }

      const foundVariableName = text.slice(start - from, end - from);
      const variableNameWrapper = text.slice(start - from - 2, end - from + 2);

      if (!/{{\s*([\w.]+)\s*}}/.test(variableNameWrapper)) {
        return null;
      }

      if (!(foundVariableName in self.activeEnvironment)) {
        return null;
      }

      return {
        pos: start - 2, // -2 for the double opening braces
        end: end + 2, // +2 for the double closing braces
        above: true,
        create() {
          const dom = document.createElement('div');
          dom.className = 'cm-tooltip-variable-value';

          const tooltipValue = `${self.activeEnvironment[foundVariableName]}`;

          dom.textContent = tooltipValue;

          return { dom };
        },
      };
    });
  }

  // get accessor
  get value() {
    return this.innerValue;
  }

  // set accessor including call the onchange callback
  set value(v: string) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  // From ControlValueAccessor interface
  writeValue(value: string) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  // From ControlValueAccessor interface
  registerOnChange(fn: (_: unknown) => void) {
    this.onChangeCallback = fn;
  }

  // From ControlValueAccessor interface
  registerOnTouched(fn: (_: unknown) => void) {
    this.onTouchedCallback = fn;
  }

  focusChanged(focused: boolean) {
    if (!focused) {
      this.blurChange.emit(this.innerValue);
    }
  }

  getRanges(val: string, highlight = VariableRegex) {
    const ranges: { from: number; to: number; value: string }[] = [];
    let match;
    while (((match = highlight.exec(val)), match !== null)) {
      ranges.push({
        from: match.index,
        to: match.index + match[0]!.length,
        value: match[1] || '',
      });
      if (!highlight.global) {
        // non-global regexes do not increase lastIndex, causing an infinite loop,
        // but we can just break manually after the first match
        break;
      }
    }
    return ranges;
  }

  private onTouchedCallback: (_: unknown) => void = () => {};
  private onChangeCallback: (_: unknown) => void = () => {};
}
