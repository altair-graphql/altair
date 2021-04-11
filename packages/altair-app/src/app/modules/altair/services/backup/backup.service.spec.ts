import { TestBed } from '@angular/core/testing';
import { mock } from '../../../testing';
import { NotifyService } from '../notify/notify.service';

import { BackupService } from './backup.service';

describe('BackupService', () => {
  let service: BackupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: NotifyService,
          useFactory: () => mock(),
        },
      ]
    });
    service = TestBed.inject(BackupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
