import { TestBed, inject } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';

import { GqlService } from './gql.service';
import * as services from '../../services';
import { NotifyService } from '../notify/notify.service';
import { ToastrModule } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { empty as observableEmpty } from 'rxjs';

describe('GqlService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        GqlService,
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

  it('should ...', inject([GqlService], (service: GqlService) => {
    expect(service).toBeTruthy();
  }));
});
