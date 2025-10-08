import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  input
} from '@angular/core';

@Component({
  selector: 'app-element-wrapper',
  templateUrl: './element-wrapper.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ElementWrapperComponent implements AfterViewInit, OnChanges {
  readonly element = input<HTMLElement>();
  readonly windowId = input('');
  readonly activeWindowId = input('');

  @ViewChild('elRef', { static: true }) elRef?: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.handleRender();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.handleRender();
  }

  handleRender() {
    const element = this.element();
    if (element && this.elRef) {
      const windowId = this.windowId();
      if (windowId && windowId !== this.activeWindowId()) {
        return;
      }

      this.elRef.nativeElement.appendChild(element);
    }
  }
}
