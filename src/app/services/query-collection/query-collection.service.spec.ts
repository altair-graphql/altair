import { TestBed, inject } from '@angular/core/testing';

import { QueryCollectionService } from './query-collection.service';
import { StorageService } from '../storage/storage.service';

describe('QueryCollectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QueryCollectionService, StorageService]
    });
  });

  it('should be created', inject([QueryCollectionService], (service: QueryCollectionService) => {
    expect(service).toBeTruthy();
  }));
});
