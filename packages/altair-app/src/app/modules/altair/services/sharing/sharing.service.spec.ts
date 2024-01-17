import { TestBed } from '@angular/core/testing';

import { SharingService } from './sharing.service';
import { mock } from '../../../../../testing';
import * as services from './../../services';

describe('SharingService', () => {
  let service: SharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: services.ApiService, useValue: mock() },
        { provide: services.AccountService, useValue: mock() },
        { provide: services.WindowService, useValue: mock() },
        { provide: services.NotifyService, useValue: mock() },
      ],
    });
    service = TestBed.inject(SharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
