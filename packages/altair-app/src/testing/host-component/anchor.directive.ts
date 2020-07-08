import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appTestAnchor]',
})
export class TestAnchorDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
