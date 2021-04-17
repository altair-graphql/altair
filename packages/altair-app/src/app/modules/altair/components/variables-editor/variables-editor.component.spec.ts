import { expect, describe, it } from '@jest/globals';

import { VariablesEditorComponent } from './variables-editor.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper, mount } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('VariablesEditorComponent', () => {
  let wrapper: NgxTestWrapper<VariablesEditorComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: VariablesEditorComponent,
      imports: [
        MockModule(SharedModule),
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      propsData: {
        queryOperations: [],
      }
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should pass editor config to codemirror instance as options', () => {
    expect(wrapper.find('ngx-codemirror').props('options').mode).toBe('graphql-variables');
  });

  it('should update tabSize passed to codemirror when it changes', async () => {
    wrapper.setProps({
      tabSize: 2
    });

    await wrapper.nextTick();
    expect(wrapper.find('ngx-codemirror').props('options').tabSize).toBe(2);

    wrapper.setProps({
      tabSize: 4
    });

    await wrapper.nextTick();
    expect(wrapper.find('ngx-codemirror').props('options').tabSize).toBe(4);
  });
});
