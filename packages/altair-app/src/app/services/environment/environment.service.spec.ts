import { TestBed } from '@angular/core/testing';

import { empty as observableEmpty } from 'rxjs';

import { EnvironmentService } from './environment.service';
import { Store } from '@ngrx/store';

describe('EnvironmentService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      EnvironmentService,
      { provide: Store, useValue: {
        subscribe: () => {},
        select: () => [],
        map: () => observableEmpty(),
        dispatch: () => {}
      } }
    ]
  }));

  it('should be created', () => {
    const service: EnvironmentService = TestBed.get(EnvironmentService);
    expect(service).toBeTruthy();
  });
});
