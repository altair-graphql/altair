import { expect } from '@jest/globals';
import { DialogComponent } from './dialog.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing/utils';
import { MockModule } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DialogComponent', () => {
  let wrapper: NgxTestWrapper<DialogComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: DialogComponent,
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

  it('should have default property values', () => {
    const component = wrapper.componentInstance;
    expect(component.showDialog()).toBe(false);
    expect(component.heading()).toBe('');
    expect(component.subheading()).toBe('');
    expect(component.showHeader()).toBe(true);
    expect(component.showFooter()).toBe(true);
  });

  it('should emit toggleDialog and saveChange events when onClickSave is called with showDialog false', async () => {
    const component = wrapper.componentInstance;
    const mockEvent = new Event('click');

    wrapper.setProps({ showDialog: false });
    component.onClickSave(mockEvent);
    await wrapper.nextTick();

    expect(wrapper.emitted('toggleDialog')).toBeTruthy();
    expect(wrapper.emitted('saveChange')).toBeTruthy();

    const toggleEmitted = wrapper.emitted('toggleDialog')![0][0];
    const saveEmitted = wrapper.emitted('saveChange')![0][0];

    expect(toggleEmitted).toBe(true);
    expect(saveEmitted).toBe(mockEvent);
  });

  it('should emit toggleDialog and saveChange events when onClickSave is called with showDialog true', async () => {
    const component = wrapper.componentInstance;
    const mockEvent = new Event('click');

    wrapper.setProps({ showDialog: true });
    await wrapper.nextTick();
    component.onClickSave(mockEvent);

    expect(wrapper.emitted('toggleDialog')).toBeTruthy();
    expect(wrapper.emitted('saveChange')).toBeTruthy();

    const toggleEmitted = wrapper.emitted('toggleDialog')![0][0];
    const saveEmitted = wrapper.emitted('saveChange')![0][0];

    expect(toggleEmitted).toBe(false);
    expect(saveEmitted).toBe(mockEvent);
  });

  it('should emit toggleDialog and saveChange events when onSubmit is called with showDialog false', () => {
    const component = wrapper.componentInstance;
    const mockEvent = new Event('submit');

    wrapper.setProps({ showDialog: false });
    component.onSubmit(mockEvent);

    expect(wrapper.emitted('toggleDialog')).toBeTruthy();
    expect(wrapper.emitted('saveChange')).toBeTruthy();

    const toggleEmitted = wrapper.emitted('toggleDialog')![0][0];
    const saveEmitted = wrapper.emitted('saveChange')![0][0];

    expect(toggleEmitted).toBe(true);
    expect(saveEmitted).toBe(mockEvent);
  });

  it('should emit toggleDialog and saveChange events when onSubmit is called with showDialog true', async () => {
    const component = wrapper.componentInstance;
    const mockEvent = new Event('submit');

    wrapper.setProps({ showDialog: true });
    await wrapper.nextTick();
    component.onSubmit(mockEvent);

    expect(wrapper.emitted('toggleDialog')).toBeTruthy();
    expect(wrapper.emitted('saveChange')).toBeTruthy();

    const toggleEmitted = wrapper.emitted('toggleDialog')![0][0];
    const saveEmitted = wrapper.emitted('saveChange')![0][0];

    expect(toggleEmitted).toBe(false);
    expect(saveEmitted).toBe(mockEvent);
  });
});
