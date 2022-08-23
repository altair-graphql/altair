import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { ElectronAppService } from '../electron-app/electron-app.service';

import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(ElectronAppService)],
      teardown: { destroyAfterEach: true },
    });
    service = TestBed.inject(AccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
