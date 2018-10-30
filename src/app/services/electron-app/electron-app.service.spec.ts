import { TestBed, inject } from '@angular/core/testing';

import { ElectronAppService } from './electron-app.service';
import { Store, StoreModule } from '@ngrx/store';
import { WindowService, DbService } from '..';
import { NgxElectronModule } from 'ngx-electron';
import { empty as observableEmpty } from 'rxjs';

describe('ElectronAppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxElectronModule,
      ],
      providers: [
        ElectronAppService,
        WindowService,
        DbService,
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

  it('should be created', inject([ElectronAppService], (service: ElectronAppService) => {
    expect(service).toBeTruthy();
  }));
});
