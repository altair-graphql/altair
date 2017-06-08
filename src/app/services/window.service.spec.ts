import { TestBed, inject } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';

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
          map: () => Observable.empty(),
          dispatch: () => {}
        } }
      ]
    });
  });

  it('should ...', inject([WindowService], (service: WindowService) => {
    expect(service).toBeTruthy();
  }));
});
