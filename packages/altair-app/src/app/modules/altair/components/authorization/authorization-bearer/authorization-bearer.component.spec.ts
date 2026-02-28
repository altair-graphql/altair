import { FormsModule } from '@angular/forms';

import { AuthorizationBearerComponent } from './authorization-bearer.component';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';
import { ComponentModule } from '../../components.module';
import { MockModule } from 'ng-mocks';
import { mount } from 'testing/utils';
import { NgxTestWrapper } from 'testing/wrapper';

describe('AuthorizationBearerComponent', () => {
  let wrapper: NgxTestWrapper<AuthorizationBearerComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: AuthorizationBearerComponent,
      imports: [MockModule(SharedModule), MockModule(ComponentModule), FormsModule],
      propsData: {
        authData: { token: 'my-secret-token' },
      },
    });
  });

  it('should create', () => {
    expect(wrapper.component).toBeTruthy();
  });

  it('should emit authDataChange with authData input on init', () => {
    expect(wrapper.emitted('authDataChange')![0]![0]).toEqual({
      token: 'my-secret-token',
    });
  });

  it('should emit authDataChange when form values change', async () => {
    wrapper.componentInstance.bearerForm.patchValue({ token: 'new-token' });
    await wrapper.nextTick();

    expect(wrapper.emitted('authDataChange')![1]![0]).toEqual({
      token: 'new-token',
    });
  });
});
