import { TestBed, inject } from '@angular/core/testing';

import { HttpModule } from '@angular/http';

import { GqlService } from './gql.service';
import * as services from '../services';
import { Store } from '../store';

describe('GqlService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [GqlService, Store, services.StoreHelper]
    });
  });

  it('should ...', inject([GqlService], (service: GqlService) => {
    expect(service).toBeTruthy();
  }));
});
