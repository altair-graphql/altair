import { TestBed, inject } from '@angular/core/testing';

import { ElectronAppService } from './electron-app.service';
import { Store } from '@ngrx/store';
import { WindowService, DbService, NotifyService, StorageService } from '..';
import { EMPTY } from 'rxjs';
import { GqlService } from '../gql/gql.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MockProvider } from 'ng-mocks';
import { mock, mockStoreFactory } from '../../../../../testing';

describe('ElectronAppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false },
      imports: [],
      providers: [
        ElectronAppService,
        MockProvider(WindowService),
        DbService,
        MockProvider(NotifyService),
        {
          provide: StorageService,
          useValue: mock<StorageService>({
            changes() {
              return EMPTY as any;
            },
          }),
        },
        GqlService,
        {
          provide: Store,
          useValue: mockStoreFactory(),
        },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    });
  });

  it('should be created', inject(
    [ElectronAppService],
    (service: ElectronAppService) => {
      expect(service).toBeTruthy();
    }
  ));
});
