import { SetCssVariablesDirective } from './set-css-variables.directive';
import { ElementRef } from '@angular/core';
class MockElementRef extends ElementRef {}

describe('SetCssVariablesDirective', () => {
  it('should create an instance', () => {
    const directive = new SetCssVariablesDirective(new MockElementRef(document.body));
    expect(directive).toBeTruthy();
  });
});
