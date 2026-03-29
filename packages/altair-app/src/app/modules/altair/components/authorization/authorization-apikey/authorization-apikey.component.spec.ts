import { FormsModule } from '@angular/forms';

import { AuthorizationApikeyComponent } from './authorization-apikey.component';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';
import { ComponentModule } from '../../components.module';
import { MockModule } from 'ng-mocks';
import { mount } from 'testing/utils';
import { NgxTestWrapper } from 'testing/wrapper';

describe('AuthorizationApikeyComponent', () => {
  let wrapper: NgxTestWrapper<AuthorizationApikeyComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: AuthorizationApikeyComponent,
      imports: [MockModule(SharedModule), MockModule(ComponentModule), FormsModule],
      propsData: {
        authData: { headerName: 'Authorization', headerValue: 'Bearer token123' },
      },
    });
  });

  it('should create', () => {
    expect(wrapper.component).toBeTruthy();
  });

  it('should emit authDataChange with authData input on init', () => {
    expect(wrapper.emitted('authDataChange')![0]![0]).toEqual({
      headerName: 'Authorization',
      headerValue: 'Bearer token123',
    });
  });

  it('should emit authDataChange when form values change', async () => {
    wrapper.componentInstance.apiKeyForm.patchValue({ headerName: 'X-API-Key' });
    await wrapper.nextTick();

    expect(wrapper.emitted('authDataChange')![1]![0]).toEqual({
      headerName: 'X-API-Key',
      headerValue: 'Bearer token123',
    });
  });
});
