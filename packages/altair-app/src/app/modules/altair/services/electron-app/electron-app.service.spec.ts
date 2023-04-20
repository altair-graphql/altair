import { TestBed, inject } from '@angular/core/testing';

import { ElectronAppService } from './electron-app.service';
import { Store, StoreModule } from '@ngrx/store';
import { WindowService, DbService, NotifyService, StorageService } from '..';
import { EMPTY } from 'rxjs';
import { GqlService } from '../gql/gql.service';
import { HttpClientModule } from '@angular/common/http';
import { MockProvider } from 'ng-mocks';
import { mock } from '../../../../../testing';

describe('ElectronAppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
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
          useValue: {
            subscribe: () => {},
            select: () => [],
            map: () => EMPTY,
            dispatch: () => {},
          },
        },
      ],
      teardown: { destroyAfterEach: false },
    });
  });

  it('should be created', inject(
    [ElectronAppService],
    (service: ElectronAppService) => {
      expect(service).toBeTruthy();
    }
  ));
});
