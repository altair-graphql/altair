import { TestBed, inject } from '@angular/core/testing';

import { KeybinderService } from './keybinder.service';
import { Store } from '@ngrx/store';
import { empty as observableEmpty } from 'rxjs';
import { WindowService } from '../window.service';
import { DbService } from '../db.service';
import { ElectronAppService } from '../electron-app/electron-app.service';
import { ElectronService } from 'ngx-electron';
import { NotifyService } from '../notify/notify.service';
import { GqlService } from '../gql/gql.service';
import { HttpClientModule } from '@angular/common/http';
import { MockProvider } from 'ng-mocks';

describe('KeybinderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers: [
        KeybinderService,
        WindowService,
        DbService,
        ElectronAppService,
        ElectronService,
        MockProvider(NotifyService),
        GqlService,
        {
          provide: Store, useValue: {
            subscribe: () => { },
            select: () => [],
            map: () => observableEmpty(),
            dispatch: () => { }
          }
        }
      ]
    });
  });

  it('should be created', inject([KeybinderService], (service: KeybinderService) => {
    expect(service).toBeTruthy();
  }));
});
