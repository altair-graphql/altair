import { expect, describe, it } from '@jest/globals';

import { VariablesEditorComponent } from './variables-editor.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper, mount } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('VariablesEditorComponent', () => {
  let wrapper: NgxTestWrapper<VariablesEditorComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: VariablesEditorComponent,
      imports: [MockModule(SharedModule)],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
