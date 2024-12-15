import { TestBed, inject } from '@angular/core/testing';

import { KeybinderService } from './keybinder.service';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { WindowService } from '../window.service';
import { DbService } from '../db.service';
import { ElectronAppService } from '../electron-app/electron-app.service';
import { NotifyService } from '../notify/notify.service';
import { GqlService } from '../gql/gql.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MockProvider } from 'ng-mocks';

describe('KeybinderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false },
      imports: [],
      providers: [
        KeybinderService,
        MockProvider(WindowService),
        DbService,
        ElectronAppService,
        MockProvider(NotifyService),
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
        provideHttpClient(withInterceptorsFromDi()),
      ],
    });
  });

  it('should be created', inject([KeybinderService], (service: KeybinderService) => {
    expect(service).toBeTruthy();
  }));
});
