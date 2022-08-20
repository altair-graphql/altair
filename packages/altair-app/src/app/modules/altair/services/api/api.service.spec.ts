import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { AccountService } from '../account/account.service';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(AccountService)],
      teardown: { destroyAfterEach: false },
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
