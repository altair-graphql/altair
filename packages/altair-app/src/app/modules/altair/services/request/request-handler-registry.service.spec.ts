import { TestBed } from '@angular/core/testing';

import { RequestHandlerRegistryService } from './request-handler-registry.service';

describe('RequestHandlerRegistryService', () => {
  let service: RequestHandlerRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestHandlerRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
