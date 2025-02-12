import { TestBed } from '@angular/core/testing';

import { WebExtensionsService } from './webextensions.service';
import { MockProvider } from 'ng-mocks';
import { WindowService } from '../window.service';

describe('WebextensionsService', () => {
  let service: WebExtensionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(WindowService)],
    });
    service = TestBed.inject(WebExtensionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
