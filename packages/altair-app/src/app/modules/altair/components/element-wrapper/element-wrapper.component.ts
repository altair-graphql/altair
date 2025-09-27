import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-element-wrapper',
  templateUrl: './element-wrapper.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElementWrapperComponent implements AfterViewInit, OnChanges {
  @Input() element?: HTMLElement;
  @Input() windowId = '';
  @Input() activeWindowId = '';

  @ViewChild('elRef', { static: true }) elRef?: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.handleRender();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.handleRender();
  }

  handleRender() {
    if (this.element && this.elRef) {
      if (this.windowId && this.windowId !== this.activeWindowId) {
        return;
      }

      this.elRef.nativeElement.appendChild(this.element);
    }
  }
}
