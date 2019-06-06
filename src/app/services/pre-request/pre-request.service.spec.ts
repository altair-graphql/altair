import { TestBed } from '@angular/core/testing';

import { PreRequestService } from './pre-request.service';

describe('PreRequestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreRequestService = TestBed.get(PreRequestService);
    expect(service).toBeTruthy();
  });
});
