import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  input,
  effect,
} from '@angular/core';

@Component({
  selector: 'app-element-wrapper',
  templateUrl: './element-wrapper.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ElementWrapperComponent implements AfterViewInit {
  readonly element = input<HTMLElement>();
  readonly windowId = input('');
  readonly activeWindowId = input('');

  @ViewChild('elRef', { static: true }) elRef?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      this.handleRender(this.element(), this.windowId());
    });
  }

  ngAfterViewInit(): void {
    this.handleRender(this.element(), this.windowId());
  }

  handleRender(element?: HTMLElement, windowId?: string) {
    if (element && this.elRef) {
      if (windowId && windowId !== this.activeWindowId()) {
        return;
      }

      this.elRef.nativeElement.appendChild(element);
    }
  }
}
