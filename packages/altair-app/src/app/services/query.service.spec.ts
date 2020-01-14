import { TestBed, inject } from '@angular/core/testing';

import { Store } from '@ngrx/store';
import * as services from './index';
import { QueryService } from './query.service';

describe('QueryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QueryService,
        services.DbService,
        { provide: Store, useValue: {
          subscribe: () => {}
        } }
      ]
    });
  });

  it('should ...', inject([QueryService], (service: QueryService) => {
    expect(service).toBeTruthy();
  }));
});
