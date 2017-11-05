import { TestBed, inject } from '@angular/core/testing';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { NotifyService } from './notify.service';

describe('NotifyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastModule.forRoot()
      ],
      providers: [NotifyService]
    });
  });

  it('should be created', inject([NotifyService], (service: NotifyService) => {
    expect(service).toBeTruthy();
  }));
});
