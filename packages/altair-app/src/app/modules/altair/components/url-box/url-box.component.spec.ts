import { expect, describe, it } from '@jest/globals';

import { UrlBoxComponent } from './url-box.component';

import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UrlBoxComponent', () => {
  let wrapper: NgxTestWrapper<UrlBoxComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: UrlBoxComponent,
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

  it('should render correctly with queryOperations > 1', async() => {
    wrapper.setProps({
      queryOperations: [
        { name: { value: 'operation 1' } },
        { name: { value: 'operation 2' } },
      ],
    });
    await wrapper.nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });
});
