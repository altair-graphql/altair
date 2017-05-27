import { TestBed, inject } from '@angular/core/testing';

import { DbService } from './db.service';

describe('DbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DbService]
    });
  });

  it('should ...', inject([DbService], (service: DbService) => {
    expect(service).toBeTruthy();
  }));
});
