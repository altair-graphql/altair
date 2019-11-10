import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debug } from 'app/utils/logger';

interface BoundaryMarker {
  index: number;
  type: 'start' | 'stop';
  className?: string;
}

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
    }
  ],
})
export class FancyInputComponent implements ControlValueAccessor, OnInit {

  // @Input() value = '';
  @Input() placeholder = '';
  @Output() blur = new EventEmitter();
  @Output() submit = new EventEmitter();

  @ViewChild('fancyInputEl', { static: true }) fancyInputEl: ElementRef;
  @ViewChild('fancyInputHighlightsEl',  { static: true }) fancyInputHighlightsEl: ElementRef;


  highlightData = {
    sections: [] as any[]
  };

  private innerValue = '';
  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: any) => void = () => {};

  // get accessor
  get value(): any {
    return this.innerValue;
};

  // set accessor including call the onchange callback
  set value(v: any) {
      if (v !== this.innerValue) {
          this.innerValue = v;
          this.onChangeCallback(v);
      }
  }

  // From ControlValueAccessor interface
  writeValue(value: any) {
      if (value !== this.innerValue) {
          this.innerValue = value;
      }
  }

  // From ControlValueAccessor interface
  registerOnChange(fn: any) {
      this.onChangeCallback = fn;
  }

  // From ControlValueAccessor interface
  registerOnTouched(fn: any) {
      this.onTouchedCallback = fn;
  }

  constructor() { }

  ngOnInit() {
    if (this.detectBrowser() === 'firefox') {
      this.fixFirefox();
    }
    setTimeout(() => {
      this.handleInput();
    }, 1);
  }

  handleInput() {
    const val = this.fancyInputEl.nativeElement.value;
    const ranges = this.getRanges(val, /{{\s*[\w\.]+\s*}}/g);
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
    setTimeout(() => {
      this.updateHighlighterScroll();
    }, 1);

    // Set touched on blur
    this.onTouchedCallback();
    this.blur.next(this.innerValue);
  }
  handleSubmit() {
    this.submit.next(this.innerValue);
  }
  blockContainerScroll() {}
  detectBrowser() {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('firefox') !== -1) {
      return 'firefox';
    } else if (!!ua.match(/msie|trident\/7|edge/)) {
      return 'ie';
    } else if (!!ua.match(/ipad|iphone|ipod/) && ua.indexOf('windows phone') === -1) {
      // Windows Phone flags itself as "like iPhone", thus the extra check
      return 'ios';
    } else {
      return 'other';
    }
  }
  fixFirefox() {}
  getRanges(val, highlight) {
    const ranges: any[] = [];
    let match;
    while (match = highlight.exec(val), match !== null) {
      ranges.push([match.index, match.index + match[0].length]);
      if (!highlight.global) {
        // non-global regexes do not increase lastIndex, causing an infinite loop,
        // but we can just break manually after the first match
        break;
      }
    }
    return ranges;
  }

  // Prevent overlapping ranges
  removeStaggeredRanges(ranges) {
    const unstaggeredRanges: any[] = [];
    ranges.forEach((range) => {
      const isStaggered = unstaggeredRanges.some((unstaggeredRange) => {
        const isStartInside = range[0] > unstaggeredRange[0] && range[0] < unstaggeredRange[1];
        const isStopInside = range[1] > unstaggeredRange[0] && range[1] < unstaggeredRange[1];
        return isStartInside !== isStopInside; // xor
      });
      if (!isStaggered) {
        unstaggeredRanges.push(range);
      }
    });
    return unstaggeredRanges;
  }

  getBoundaries(ranges) {
    const boundaries: BoundaryMarker[] = [];
    ranges.forEach((range) => {
      boundaries.push({
        type: 'start',
        index: range[0],
        className: range.className
      });
      boundaries.push({
        type: 'stop',
        index: range[1]
      });
    });

    this.sortBoundaries(boundaries);
    return boundaries;
  }

  sortBoundaries(boundaries: BoundaryMarker[]) {
    // backwards sort (since marks are inserted right to left)
    boundaries.sort(function(a, b) {
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
    const sections: any[] = [];
    let lastBoundary = {
      index: 0,
      type: ''
    };

    boundaries.forEach(boundary => {
      sections.push({
        content: val.substring(lastBoundary.index, boundary.index),
        type: lastBoundary.type === 'start' && boundary.type === 'stop' && 'mark'
      });
      lastBoundary = boundary;
    });
    sections.push({
      content: val.substring(lastBoundary.index)
    });

    return sections;
  }

  updateHighlighterScroll() {
    setTimeout(() => {
      this.fancyInputHighlightsEl.nativeElement.scrollLeft = this.fancyInputEl.nativeElement.scrollLeft;
      this.fancyInputHighlightsEl.nativeElement.scrollTop = this.fancyInputEl.nativeElement.scrollTop;
      this.fancyInputHighlightsEl.nativeElement.height = this.fancyInputEl.nativeElement.height;
    }, 10);
    // highlighter.scrollLeft = input.scrollLeft
    // highlighter.scrollTop = input.scrollTop
    // highlighter.height = input.height
  }

  trackByIndex(index) {
    return index;
  }

}
