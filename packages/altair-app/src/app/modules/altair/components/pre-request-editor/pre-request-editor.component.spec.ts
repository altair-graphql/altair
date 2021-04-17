import { expect, describe, it } from '@jest/globals';

import { PreRequestEditorComponent } from './pre-request-editor.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxTestWrapper, mount } from '../../../../../testing';
import { MockModule } from 'ng-mocks';

describe('PreRequestEditorComponent', () => {
  let wrapper: NgxTestWrapper<PreRequestEditorComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: PreRequestEditorComponent,
      imports: [
        MockModule(SharedModule),
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      propsData: {
        preRequest: {
          enabled: true,
          script: '',
        }
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
