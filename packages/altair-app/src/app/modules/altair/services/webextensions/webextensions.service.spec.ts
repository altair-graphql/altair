import { TestBed } from '@angular/core/testing';

import { WebExtensionsService } from './webextensions.service';

describe('WebextensionsService', () => {
  let service: WebExtensionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebExtensionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
