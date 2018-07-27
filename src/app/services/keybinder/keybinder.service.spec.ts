import { TestBed, inject } from '@angular/core/testing';

import { KeybinderService } from './keybinder.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { WindowService } from '../window.service';
import { DbService } from '../db.service';

describe('KeybinderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        KeybinderService,
        WindowService,
        DbService,
        {
          provide: Store, useValue: {
            subscribe: () => { },
            select: () => [],
            map: () => Observable.empty(),
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
