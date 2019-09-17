import { TestBed, inject } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';

import { NotifyService } from './notify.service';
import { Store } from '@ngrx/store';
import { empty as observableEmpty } from 'rxjs';

describe('NotifyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot()
      ],
      providers: [
        NotifyService,
        { provide: Store, useValue: {
          subscribe: () => observableEmpty(),
          select: () => observableEmpty(),
          map: () => observableEmpty(),
          first: () => observableEmpty(),
          pipe: () => observableEmpty(),
          dispatch: () => {}
        } }
      ]
    });
  });

  it('should be created', inject([NotifyService], (service: NotifyService) => {
    expect(service).toBeTruthy();
  }));
});
