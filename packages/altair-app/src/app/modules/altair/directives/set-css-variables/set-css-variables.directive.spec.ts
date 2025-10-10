import { inject, TestBed } from '@angular/core/testing';
import { SetCssVariablesDirective } from './set-css-variables.directive';
import { ElementRef } from '@angular/core';
class MockElementRef extends ElementRef {}

describe('SetCssVariablesDirective', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false },
      imports: [],
      providers: [
        SetCssVariablesDirective,
        {
          provide: ElementRef,
          useFactory: () => new MockElementRef(document.body),
        },
      ],
    })
  );

  it('should create an instance', inject(
    [SetCssVariablesDirective],
    (directive: SetCssVariablesDirective) => {
      expect(directive).toBeTruthy();
    }
  ));
});
