import { MockInstance } from 'ng-mocks';
import { CachedIfDirective } from './cached-if.directive';
import { ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { mock } from 'testing';
import { inject, TestBed } from '@angular/core/testing';

describe('CachedIfDirective', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false },
      imports: [],
      providers: [
        CachedIfDirective,
        {
          provide: TemplateRef,
          useFactory: () => mock<TemplateRef<any>>(),
        },
        {
          provide: ViewContainerRef,
          useFactory: () => mock<ViewContainerRef>(),
        },
      ],
    })
  );

  it('should create an instance', inject(
    [CachedIfDirective],
    (directive: CachedIfDirective) => {
      expect(directive).toBeTruthy();
    }
  ));
});
