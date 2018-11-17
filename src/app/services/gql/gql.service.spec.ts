import { TestBed, inject } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';

import { GqlService } from './gql.service';
import * as services from '../../services';
import { NotifyService } from '../notify/notify.service';
import { ToastrModule } from 'ngx-toastr';

describe('GqlService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [GqlService, NotifyService]
    });
  });

  it('should ...', inject([GqlService], (service: GqlService) => {
    expect(service).toBeTruthy();
  }));
});
