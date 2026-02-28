import { CachedIfDirective } from './cached-if.directive';
import { TemplateRef, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('CachedIfDirective', () => {
  it('should create an instance', () => {
    const mockTemplateRef = {};
    const mockViewContainer = {
      createEmbeddedView: jest.fn().mockReturnValue({
        destroy: jest.fn(),
        detach: jest.fn(),
      }),
      indexOf: jest.fn().mockReturnValue(-1),
      insert: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CachedIfDirective,
        {
          provide: TemplateRef,
          useValue: mockTemplateRef,
        },
        {
          provide: ViewContainerRef,
          useValue: mockViewContainer,
        },
      ],
    });

    const directive = TestBed.inject(CachedIfDirective);
    expect(directive).toBeTruthy();
  });

  it('should have appCachedIf input', () => {
    TestBed.configureTestingModule({
      providers: [
        CachedIfDirective,
        {
          provide: TemplateRef,
          useValue: {},
        },
        {
          provide: ViewContainerRef,
          useValue: {},
        },
      ],
    });

    const directive = TestBed.inject(CachedIfDirective);
    expect((directive as any).appCachedIf).toBeDefined();
  });
});
