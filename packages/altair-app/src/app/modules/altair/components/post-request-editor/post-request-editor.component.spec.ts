import { expect, describe, it } from '@jest/globals';

import { PostRequestEditorComponent } from './post-request-editor.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxTestWrapper, mount } from '../../../../../testing';
import { MockModule, MockProviders } from 'ng-mocks';
import { PreRequestService } from '../../services';

describe('PostRequestEditorComponent', () => {
  let wrapper: NgxTestWrapper<PostRequestEditorComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: PostRequestEditorComponent,
      imports: [MockModule(SharedModule)],
      providers: [MockProviders(PreRequestService)],
      schemas: [NO_ERRORS_SCHEMA],
      propsData: {
        postRequest: {
          enabled: true,
          script: '',
        },
      },
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
