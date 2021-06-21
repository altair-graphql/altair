import { expect, describe, it } from '@jest/globals';
import { WindowSwitcherComponent } from './window-switcher.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper, mount } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';

describe('WindowSwitcherComponent', () => {
  let wrapper: NgxTestWrapper<WindowSwitcherComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: WindowSwitcherComponent,
      imports: [
        MockModule(SharedModule),
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        {
          provide: AltairConfig,
          useValue: new AltairConfig(),
        },
      ],
      propsData: {
        windows: {},
        windowIds: [],
        closedWindows: [],
        activeWindowId: '',
      }
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
