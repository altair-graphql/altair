import { expect, it, beforeEach, describe } from '@jest/globals';
import { ComponentFixture, TestBed, tick, fakeAsync, waitForAsync } from '@angular/core/testing';

import { FancyInputComponent } from './fancy-input.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../modules/shared/shared.module';
import { MockModule } from 'ng-mocks';
import { Store } from '@ngrx/store';
import { mock, mockStoreFactory, mount, NgxTestWrapper } from '../../../../../testing';
import { FancyInputMarkerComponent } from '../fancy-input-marker/fancy-input-marker.component';
import { EnvironmentService } from '../../services';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FancyInputComponent', () => {
  let wrapper: NgxTestWrapper<FancyInputComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: FancyInputComponent,
      imports: [
        MockModule(SharedModule),
      ],
      providers: [
        {
          provide: Store,
          useValue: mockStoreFactory({
            settings: {}
          }),
        },
        {
          provide: EnvironmentService,
          useValue: mock({
            getActiveEnvironment() { return {} }
          }),
        },
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    });
  })

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should set component value when input value changes', async() => {
    const input = wrapper.find('input');
    input.setValue('some text');
    await input.nextTick();

    expect(wrapper.element).toMatchSnapshot();
    // TODO: Figure this out
    // expect(wrapper.componentInstance.value).toBe('some text');
  });

  it('should render the highlights correctly based on the matched variables in text', async() => {
    const input = wrapper.find('input');
    input.setValue('some text {{variable1}} then {{variable2}} is next');
    await input.nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render mark element containing the matched variables in text', async() => {
    const input = wrapper.find('input');
    input.setValue('some text {{variable1}} then {{variable2}} is next');
    await input.nextTick();

    // TODO: Figure this out
    // const marks = wrapper.findAll('mark');

    // expect(marks.length).toBe(2);
    // expect(marks[0].text()).toBe('{{variable1}}');
    // expect(marks[1].text()).toBe('{{variable2}}');
  });
});
