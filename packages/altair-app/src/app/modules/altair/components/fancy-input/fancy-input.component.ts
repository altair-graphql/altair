import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Store } from '@ngrx/store';
import { EnvironmentService } from '../../services';
import { debug } from '../../utils/logger';
import { distinct, distinctUntilChanged, map } from 'rxjs/operators';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

// import { VARIABLE_REGEX } from '../../services/environment/environment.service';
// TODO: Duplicating for now after changing to use lookahead in environment service variable regex
export const VARIABLE_REGEX = /{{\s*([\w.]+)\s*}}/g;
interface BoundaryMarker {
  index: number;
  type: 'start' | 'stop';
  className?: string;
}

export interface HighlightSection {
  content: string;
  type?: string;
}
type Range = [number, number];

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-fancy-input',
  templateUrl: './fancy-input.component.html',
  styleUrls: ['./fancy-input.component.scss'],
  preserveWhitespaces: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FancyInputComponent),
      multi: true,
    },
  ],
  standalone: false,
})
export class FancyInputComponent implements ControlValueAccessor, OnInit {
  // get accessor
  get value(): string {
    return this.innerValue;
  }

  // set accessor including call the onchange callback
  set value(v: string) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  // @Input() value = '';
  @Input() placeholder = '';
  @Output() blurChange = new EventEmitter();
  @Output() submitChange = new EventEmitter();

  @ViewChild('fancyInputEl', { static: true }) fancyInputEl?: ElementRef;
  @ViewChild('fancyInputHighlightsEl', { static: true })
  fancyInputHighlightsEl?: ElementRef;

  highlightData = {
    sections: [] as HighlightSection[],
  };

  private innerValue = '';

  activeEnvironment = {};

  constructor(
    private store: Store<RootState>,
    private environmentService: EnvironmentService
  ) {
    store
      .pipe(
        map((data) => data.environments),
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe({
        next: (data) => {
          // get active environment
          this.activeEnvironment = environmentService.getActiveEnvironment();
        },
      });
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
  registerOnTouched(fn: () => void) {
    this.onTouchedCallback = fn;
  }

  ngOnInit() {
    const handleInputTimeout = setTimeout(() => {
      this.handleInput();
      clearTimeout(handleInputTimeout);
    }, 1);
  }

  handleInput() {
    const val: string = this.fancyInputEl?.nativeElement?.value ?? '';
    const ranges = this.getRanges(val, VARIABLE_REGEX);
    const unstaggeredRanges = this.removeStaggeredRanges(ranges);
    const boundaries = this.getBoundaries(unstaggeredRanges);
    this.highlightData.sections = this.generateHighlightSections(val, boundaries);
    this.updateHighlighterScroll();
  }
  handleScroll() {
    debug.log('scrolling input');
  }
  handleKeydown() {
    this.updateHighlighterScroll();
  }
  handleBlur() {
    this.updateHighlighterScroll();

    // Set touched on blur
    this.onTouchedCallback();
    this.blurChange.next(this.innerValue);
  }
  handleSubmit() {
    this.submitChange.next(this.innerValue);
  }
  detectBrowser() {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('firefox') !== -1) {
      return 'firefox';
    } else if (ua.match(/msie|trident\/7|edge/)) {
      return 'ie';
    } else if (
      !!ua.match(/ipad|iphone|ipod/) &&
      ua.indexOf('windows phone') === -1
    ) {
      // Windows Phone flags itself as "like iPhone", thus the extra check
      return 'ios';
    } else {
      return 'other';
    }
  }
  getRanges(val: string, highlight: RegExp) {
    const ranges: Range[] = [];
    let match;
    while (((match = highlight.exec(val)), match !== null)) {
      ranges.push([match.index, match.index + match[0]!.length]);
      if (!highlight.global) {
        // non-global regexes do not increase lastIndex, causing an infinite loop,
        // but we can just break manually after the first match
        break;
      }
    }
    return ranges;
  }

  // Prevent overlapping ranges
  removeStaggeredRanges(ranges: Range[]) {
    const unstaggeredRanges: Range[] = [];
    ranges.forEach((range) => {
      const isStaggered = unstaggeredRanges.some((unstaggeredRange) => {
        const isStartInside =
          range[0] > unstaggeredRange[0] && range[0] < unstaggeredRange[1];
        const isStopInside =
          range[1] > unstaggeredRange[0] && range[1] < unstaggeredRange[1];
        return isStartInside !== isStopInside; // xor
      });
      if (!isStaggered) {
        unstaggeredRanges.push(range);
      }
    });
    return unstaggeredRanges;
  }

  getBoundaries(ranges: Range[]) {
    const boundaries: BoundaryMarker[] = [];
    ranges.forEach((range) => {
      boundaries.push({
        type: 'start',
        index: range[0],
        // className: range.className,
      });
      boundaries.push({
        type: 'stop',
        index: range[1],
      });
    });

    this.sortBoundaries(boundaries);
    return boundaries;
  }

  sortBoundaries(boundaries: BoundaryMarker[]) {
    // backwards sort (since marks are inserted right to left)
    boundaries.sort(function (a, b) {
      if (a.index !== b.index) {
        return a.index - b.index;
      } else if (a.type === 'start' && b.type === 'stop') {
        return 1;
      } else if (a.type === 'stop' && b.type === 'start') {
        return -1;
      } else {
        return 0;
      }
    });
  }
  generateHighlightSections(val: string, boundaries: BoundaryMarker[]) {
    const sections: HighlightSection[] = [];
    let lastBoundary = {
      index: 0,
      type: '',
    };

    boundaries.forEach((boundary) => {
      sections.push({
        content: val.substring(lastBoundary.index, boundary.index),
        type:
          lastBoundary.type === 'start' && boundary.type === 'stop'
            ? 'mark'
            : undefined,
      });
      lastBoundary = boundary;
    });
    sections.push({
      content: val.substring(lastBoundary.index),
    });

    return sections;
  }

  updateHighlighterScroll() {
    const updateHighlighterScrollTimeout = setTimeout(() => {
      if (!this.fancyInputHighlightsEl || !this.fancyInputEl) {
        return;
      }
      this.fancyInputHighlightsEl.nativeElement.scrollLeft =
        this.fancyInputEl.nativeElement.scrollLeft;
      this.fancyInputHighlightsEl.nativeElement.scrollTop =
        this.fancyInputEl.nativeElement.scrollTop;
      this.fancyInputHighlightsEl.nativeElement.height =
        this.fancyInputEl.nativeElement.height;
      clearTimeout(updateHighlighterScrollTimeout);
    }, 10);
    // highlighter.scrollLeft = input.scrollLeft
    // highlighter.scrollTop = input.scrollTop
    // highlighter.height = input.height
  }

  trackByIndex(index: number, s: HighlightSection) {
    return index;
  }
  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: unknown) => void = () => {};
}
