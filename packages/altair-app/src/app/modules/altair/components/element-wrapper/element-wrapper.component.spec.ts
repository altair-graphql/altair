import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ElementWrapperComponent } from './element-wrapper.component';
import { NgxTestWrapper, mount } from '../../../../../testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';


describe('ElementWrapperComponent', () => {
  let wrapper: NgxTestWrapper<ElementWrapperComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: ElementWrapperComponent,
      schemas: [ NO_ERRORS_SCHEMA ],
      propsData: {
        element: document.createElement('div'),
      }
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });
});

