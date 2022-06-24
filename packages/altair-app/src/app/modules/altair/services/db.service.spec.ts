import { TestBed, inject } from '@angular/core/testing';

import { DbService } from './db.service';

describe('DbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DbService],
      teardown: { destroyAfterEach: false },
    });
  });

  it('should ...', inject([DbService], (service: DbService) => {
    expect(service).toBeTruthy();
  }));
});
