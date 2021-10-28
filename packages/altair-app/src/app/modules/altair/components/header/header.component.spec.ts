import { NO_ERRORS_SCHEMA } from '@angular/core';
import { expect, describe, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule } from 'ng-mocks';
import { mount, NgxTestWrapper } from '../../../../../testing';
import { SharedModule } from '../../modules/shared/shared.module';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let wrapper: NgxTestWrapper<HeaderComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: HeaderComponent,
      imports: [
        MockModule(SharedModule),
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
