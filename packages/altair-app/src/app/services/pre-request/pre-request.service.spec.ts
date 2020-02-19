import { TestBed, inject } from '@angular/core/testing';

import { PreRequestService } from './pre-request.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientModule } from '@angular/common/http';

describe('PreRequestService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientModule,
    ],
    providers: [ CookieService, PreRequestService ]
  }));

  it('should be created', inject([PreRequestService], (service: PreRequestService) => {
    expect(service).toBeTruthy();
  }));
});
