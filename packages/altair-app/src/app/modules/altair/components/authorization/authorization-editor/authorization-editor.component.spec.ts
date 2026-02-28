import { FormsModule } from '@angular/forms';

import { AuthorizationEditorComponent } from './authorization-editor.component';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';
import { MockModule } from 'ng-mocks';
import { mount } from 'testing/utils';
import { NgxTestWrapper } from 'testing/wrapper';
import { AUTHORIZATION_TYPES } from 'altair-graphql-core/build/types/state/authorization.interface';

describe('AuthorizationEditorComponent', () => {
  let wrapper: NgxTestWrapper<AuthorizationEditorComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: AuthorizationEditorComponent,
      imports: [SharedModule, FormsModule, MockModule(SharedModule)],
    });
  });

  it('should create', () => {
    expect(wrapper.component).toBeTruthy();
  });

  it('should have default authorization type', () => {
    expect(wrapper.componentInstance.typeForm.value).toEqual({
      type: AUTHORIZATION_TYPES.NONE,
    });
  });

  it('should emit authTypeChange when type changes', async () => {
    wrapper.componentInstance.typeForm.patchValue({
      type: AUTHORIZATION_TYPES.BASIC,
    });
    await wrapper.nextTick();

    const emitted = wrapper.emitted() as Record<string, any[]>;
    expect(emitted).toBeTruthy();
    expect(Object.keys(emitted)).toContain('authTypeChange');
    expect(emitted['authTypeChange']?.[0]?.[0]).toEqual(AUTHORIZATION_TYPES.BASIC);
  });
});
