import { TestBed, inject } from '@angular/core/testing';

import { QueryCollectionService } from './query-collection.service';

describe('QueryCollectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QueryCollectionService]
    });
  });

  it('should be created', inject([QueryCollectionService], (service: QueryCollectionService) => {
    expect(service).toBeTruthy();
  }));
});
