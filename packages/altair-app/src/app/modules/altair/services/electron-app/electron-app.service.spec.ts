import { TestBed, inject } from '@angular/core/testing';

import { ElectronAppService } from './electron-app.service';
import { Store, StoreModule } from '@ngrx/store';
import { WindowService, DbService, NotifyService } from '..';
import { empty as observableEmpty } from 'rxjs';
import { GqlService } from '../gql/gql.service';
import { HttpClientModule } from '@angular/common/http';
import { MockProvider } from 'ng-mocks';

describe('ElectronAppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        ElectronAppService,
        MockProvider(WindowService),
        DbService,
        MockProvider(NotifyService),
        GqlService,
        {
          provide: Store,
          useValue: {
            subscribe: () => {},
            select: () => [],
            map: () => observableEmpty(),
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
