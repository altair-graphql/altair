import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockModule } from 'ng-mocks';
import { ToastPackage, ToastrModule, TOAST_CONFIG } from 'ngx-toastr';
import { mount, NgxTestWrapper } from '../../../../../testing';
import { SharedModule } from '../../modules/shared/shared.module';

import { ConfirmToastComponent } from './confirm-toast.component';

// Testing this might require some magic with the ComponentPortal in ngx-toastr
describe('ConfirmToastComponent', () => {
  let wrapper: NgxTestWrapper<ConfirmToastComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: ConfirmToastComponent,
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MockModule(SharedModule), MockModule(ToastrModule)],
      // providers: [
      //   ToastPackage,
      // ],
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });
});
