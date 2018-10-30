import { TestBed, inject } from '@angular/core/testing';

import { empty as observableEmpty } from 'rxjs';

import { StoreModule, Store } from '@ngrx/store';

import * as services from '../services';
import { WindowService } from './window.service';

describe('WindowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WindowService,
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
