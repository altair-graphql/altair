import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-element-wrapper',
  templateUrl: './element-wrapper.component.html',
  styles: [
  ]
})
export class ElementWrapperComponent implements AfterViewInit {

  @Input() element: HTMLElement;

  @ViewChild('elRef', { static: true }) elRef: ElementRef<HTMLDivElement>;

  constructor() { }

  ngAfterViewInit(): void {
    if (this.element) {
      this.elRef.nativeElement.appendChild(this.element);
    }
  }

}
