import { MockInstance } from 'ng-mocks';
import { CachedIfDirective } from './cached-if.directive';
import { TemplateRef, ViewContainerRef } from '@angular/core';
import { mock } from 'testing';

describe('CachedIfDirective', () => {
  it('should create an instance', () => {
    const directive = new CachedIfDirective(
      // MockInstance(TemplateRef),
      // MockInstance(ViewContainerRef),
      mock(),
      mock()
    );
    expect(directive).toBeTruthy();
  });
});
