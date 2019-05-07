
import { throttleTime } from 'rxjs/operators';
import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  HostBinding,
  Inject,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { debug } from 'app/utils/logger';
import { DOCUMENT } from '@angular/common';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-flex-resizer',
  templateUrl: './flex-resizer.component.html',
  styleUrls: ['./flex-resizer.component.scss']
})
export class FlexResizerComponent implements OnInit, OnDestroy {
  @Input() resizeDirection = 'left';
  @Output() resizeChange = new EventEmitter();

  @HostBinding('class.is-right') isRight = false;

  /**
   * Element to be resized
   */
  resizeElement: Element;
  resizeContainer: Element;
  draggingMode = false;
  px: number;
  py: number;
  originalX: number;
  originalWidth: number;
  diffX: number;

  /**
   * Stores the total growth factor for all the siblings of resize element
   */
  siblingGrowthFactor = 2;

  throttleMs = 100;

  documentMouseUp$ = fromEvent(this.document, 'mouseup');
  documentMouseMove$ = fromEvent(this.document, 'mousemove').pipe(throttleTime(this.throttleMs));
  elMouseMove$ = fromEvent(this.el.nativeElement, 'mousemove').pipe(throttleTime(this.throttleMs));
  elMouseDown$ = fromEvent(this.el.nativeElement, 'mousedown');

  constructor(
    private el: ElementRef,
    @Inject(DOCUMENT)
    private document: Document,
    private zone: NgZone,
  ) {
    this.resizeElement = this.el.nativeElement.parentElement;
    this.resizeContainer = this.getResizeContainer();
  }

  ngOnInit() {
    if (this.resizeDirection === 'right') {
      this.isRight = true;
    }

    this.zone.runOutsideAngular(() => {
      this.documentMouseUp$
        .pipe(untilDestroyed(this))
        .subscribe((evt: MouseEvent) => this.onMouseUp(evt));

        this.documentMouseMove$
        .pipe(untilDestroyed(this))
        .subscribe((evt: MouseEvent) => this.onResizerMove(evt));

        this.elMouseMove$
        .pipe(untilDestroyed(this))
        .subscribe((evt: MouseEvent) => this.onResizerMove(evt));

        this.elMouseDown$
        .pipe(untilDestroyed(this))
        .subscribe((evt: MouseEvent) => this.onResizerPress(evt));
    });


  }

  onResizerPress(event: MouseEvent) {
    this.draggingMode = true;
    this.originalWidth = this.resizeElement.clientWidth;
    this.originalX = event.clientX;

    this.siblingGrowthFactor = Array.from(this.resizeElement.parentElement.children)
      .filter(el => this.resizeElement !== el)
      .reduce((acc, el) => +getComputedStyle(el).getPropertyValue('flex-grow') + acc, 0);

  }

  onResizerMove(event: MouseEvent) {
    if (!this.draggingMode) {
      return true;
    }
    event.stopPropagation();
    event.preventDefault();
    this.diffX = event.clientX - this.originalX;
    const offsetY = event.clientY - this.py;

    const newWidth = this.isRight ? this.originalWidth + this.diffX : this.originalWidth - this.diffX;

    const widthRatio = newWidth / this.resizeContainer.clientWidth;
    const newGrowthFactor = (widthRatio * this.siblingGrowthFactor) / (1 - widthRatio);

    this.zone.run(() => {
      this.resizeChange.next(newGrowthFactor);
      debug.log('mouse moved resizer', newWidth, newGrowthFactor);
    });
  }

  onMouseUp(event) {
    if (!this.draggingMode) {
      return true;
    }

    this.draggingMode = false;

    debug.log('mouse up.', this.originalWidth, this.diffX);
  }

  getResizeContainer() {
    let el = this.resizeElement;

    while (el && !el.hasAttribute('data-resize-container')) {
      el = el.parentElement;
    }
    return el;
  }

  ngOnDestroy() {
  }
}
