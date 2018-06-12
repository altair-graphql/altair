import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  HostBinding,
} from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-flex-resizer',
  templateUrl: './flex-resizer.component.html',
  styleUrls: ['./flex-resizer.component.scss']
})
export class FlexResizerComponent implements OnInit {
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

  // Subject and observable for throttling mousemove
  mouseMoveSubject = new Subject();
  mouseMoveObservable = this.mouseMoveSubject.asObservable().throttleTime(200);
  constructor(
    private el: ElementRef
  ) {
    this.resizeElement = this.el.nativeElement.parentElement;
    this.resizeContainer = this.getResizeContainer();
  }

  ngOnInit() {
    this.mouseMoveObservable.subscribe((event: MouseEvent) => this.handleResizerMove(event));
    if (this.resizeDirection === 'right') {
      this.isRight = true;
    }
  }

  @HostListener('mousedown', [ '$event' ])
  onResizerPress(event: MouseEvent) {
    this.draggingMode = true;
    this.originalWidth = this.resizeElement.clientWidth;
    this.originalX = event.clientX;

    this.siblingGrowthFactor = Array.from(this.resizeElement.parentElement.children)
      .filter(el => this.resizeElement !== el)
      .reduce((acc, el) => +getComputedStyle(el).getPropertyValue('flex-grow') + acc, 0);

  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('mousemove', [ '$event' ])
  onResizerMove(event: MouseEvent) {
    if (!this.draggingMode) {
      return false;
    }
    event.stopPropagation();
    event.preventDefault();
    this.mouseMoveSubject.next(event);
  }

  handleResizerMove(event: MouseEvent) {
    this.diffX = event.clientX - this.originalX;
    const offsetY = event.clientY - this.py;

    const newWidth = this.isRight ? this.originalWidth + this.diffX : this.originalWidth - this.diffX;

    const widthRatio = newWidth / this.resizeContainer.clientWidth;
    const newGrowthFactor = (widthRatio * this.siblingGrowthFactor) / (1 - widthRatio);
    this.resizeChange.next(newGrowthFactor);
    // console.log('mouse moved resizer', newWidth, newGrowthFactor);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event) {
    if (!this.draggingMode) {
      return false;
    }

    this.draggingMode = false;

    // console.log('mouse up.', this.originalWidth, this.diffX);
  }

  getResizeContainer() {
    let el = this.resizeElement;

    while (el && !el.hasAttribute('data-resize-container')) {
      el = el.parentElement;
    }
    return el;
  }
}
