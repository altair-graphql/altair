import { expect, describe, it } from '@jest/globals';
import { WindowSwitcherComponent } from './window-switcher.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper, mount } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { NzContextMenuService } from 'ng-zorro-antd/dropdown';

describe('WindowSwitcherComponent', () => {
  let wrapper: NgxTestWrapper<WindowSwitcherComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: WindowSwitcherComponent,
      imports: [MockModule(SharedModule)],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: AltairConfig,
          useValue: new AltairConfig(),
        },
        {
          provide: NzContextMenuService,
          useValue: {},
        },
      ],
      propsData: {
        windows: {},
        windowIds: [],
        closedWindows: [],
        activeWindowId: '',
      },
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('isWindowLoading', () => {
    it('should return false if window does not exist', () => {
      expect(wrapper.componentInstance.isWindowLoading('non-existent-id')).toBe(false);
    });

    it('should return false if window layout is undefined', () => {
      wrapper.componentInstance.windows = {
        'window-1': {} as any,
      };
      expect(wrapper.componentInstance.isWindowLoading('window-1')).toBe(false);
    });

    it('should return false if window is not loading', () => {
      wrapper.componentInstance.windows = {
        'window-1': {
          layout: { isLoading: false },
        } as any,
      };
      expect(wrapper.componentInstance.isWindowLoading('window-1')).toBe(false);
    });

    it('should return true if window is loading', () => {
      wrapper.componentInstance.windows = {
        'window-1': {
          layout: { isLoading: true },
        } as any,
      };
      expect(wrapper.componentInstance.isWindowLoading('window-1')).toBe(true);
    });
  });
});
