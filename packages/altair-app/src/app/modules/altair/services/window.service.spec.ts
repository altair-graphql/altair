import { TestBed, inject } from '@angular/core/testing';

import { empty as observableEmpty } from 'rxjs';

import { StoreModule, Store } from '@ngrx/store';

import * as services from '../services';
import { WindowService } from './window.service';
import { GqlService } from './gql/gql.service';
import { HttpClientModule } from '@angular/common/http';
import { NotifyService } from './notify/notify.service';
import { MockProvider } from 'ng-mocks';

describe('WindowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers: [
        WindowService,
        GqlService,
        MockProvider(NotifyService),
        services.DbService,
        { provide: Store, useValue: {
          subscribe: () => {},
          select: () => [],
          map: () => observableEmpty(),
          dispatch: () => {}
        } }
      ]
    });
  });

  it('should ...', inject([WindowService], (service: WindowService) => {
    expect(service).toBeTruthy();
  }));
});
