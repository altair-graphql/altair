import { TestBed, inject } from '@angular/core/testing';

import { NotifyService } from './notify.service';

describe('NotifyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotifyService]
    });
  });

  it('should be created', inject([NotifyService], (service: NotifyService) => {
    expect(service).toBeTruthy();
  }));
});
