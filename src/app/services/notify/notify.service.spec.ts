import { TestBed, inject } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';

import { NotifyService } from './notify.service';

describe('NotifyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot()
      ],
      providers: [NotifyService]
    });
  });

  it('should be created', inject([NotifyService], (service: NotifyService) => {
    expect(service).toBeTruthy();
  }));
});
