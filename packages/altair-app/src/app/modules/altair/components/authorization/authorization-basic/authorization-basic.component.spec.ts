import { FormsModule } from '@angular/forms';

import { AuthorizationBasicComponent } from './authorization-basic.component';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';
import { ComponentModule } from '../../components.module';
import { Store } from '@ngrx/store';
import { MockModule, MockProvider } from 'ng-mocks';
import { mount } from 'testing/utils';
import { NgxTestWrapper } from 'testing/wrapper';

describe('AuthorizationBasicComponent', () => {
  let wrapper: NgxTestWrapper<AuthorizationBasicComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: AuthorizationBasicComponent,
      imports: [MockModule(SharedModule), MockModule(ComponentModule), FormsModule],
      providers: [MockProvider(Store)],
      propsData: {
        authData: { username: 'testuser', password: 'testpass' },
      },
    });
  });

  it('should create', () => {
    expect(wrapper.component).toBeTruthy();
  });

  it('should emit authDataChange with authData input on init', () => {
    expect(wrapper.emitted('authDataChange')![0]![0]).toEqual({
      username: 'testuser',
      password: 'testpass',
    });
  });

  it('should emit authDataChange when form values change', async () => {
    wrapper.componentInstance.basicForm.patchValue({ username: 'newuser' });
    await wrapper.nextTick();

    expect(wrapper.emitted('authDataChange')![1]![0]).toEqual({
      username: 'newuser',
      password: 'testpass',
    });
  });
});
