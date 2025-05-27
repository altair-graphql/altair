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
    expect(component.showDialog).toBe(false);
    expect(component.heading).toBe('');
    expect(component.subheading).toBe('');
    expect(component.showHeader).toBe(true);
    expect(component.showFooter).toBe(true);
    expect(component.width).toBe(520);
  });

  it('should emit toggleDialog and saveChange events when onClickSave is called with showDialog false', () => {
    const component = wrapper.componentInstance;
    const mockEvent = new Event('click');

    component.showDialog = false;
    component.onClickSave(mockEvent);

    expect(wrapper.emitted('toggleDialog')).toBeTruthy();
    expect(wrapper.emitted('saveChange')).toBeTruthy();

    const toggleEmitted = wrapper.emitted('toggleDialog')![0][0];
    const saveEmitted = wrapper.emitted('saveChange')![0][0];

    expect(toggleEmitted).toBe(true); // !false = true
    expect(saveEmitted).toBe(mockEvent);
  });

  it('should emit toggleDialog and saveChange events when onClickSave is called with showDialog true', () => {
    const component = wrapper.componentInstance;
    const mockEvent = new Event('click');

    component.showDialog = true;
    component.onClickSave(mockEvent);

    expect(wrapper.emitted('toggleDialog')).toBeTruthy();
    expect(wrapper.emitted('saveChange')).toBeTruthy();

    const toggleEmitted = wrapper.emitted('toggleDialog')![0][0];
    const saveEmitted = wrapper.emitted('saveChange')![0][0];

    expect(toggleEmitted).toBe(false); // !true = false
    expect(saveEmitted).toBe(mockEvent);
  });

  it('should emit toggleDialog and saveChange events when onSubmit is called with showDialog false', () => {
    const component = wrapper.componentInstance;
    const mockEvent = new Event('submit');

    component.showDialog = false;
    component.onSubmit(mockEvent);

    expect(wrapper.emitted('toggleDialog')).toBeTruthy();
    expect(wrapper.emitted('saveChange')).toBeTruthy();

    const toggleEmitted = wrapper.emitted('toggleDialog')![0][0];
    const saveEmitted = wrapper.emitted('saveChange')![0][0];

    expect(toggleEmitted).toBe(true); // !false = true
    expect(saveEmitted).toBe(mockEvent);
  });

  it('should emit toggleDialog and saveChange events when onSubmit is called with showDialog true', () => {
    const component = wrapper.componentInstance;
    const mockEvent = new Event('submit');

    component.showDialog = true;
    component.onSubmit(mockEvent);

    expect(wrapper.emitted('toggleDialog')).toBeTruthy();
    expect(wrapper.emitted('saveChange')).toBeTruthy();

    const toggleEmitted = wrapper.emitted('toggleDialog')![0][0];
    const saveEmitted = wrapper.emitted('saveChange')![0][0];

    expect(toggleEmitted).toBe(false); // !true = false
    expect(saveEmitted).toBe(mockEvent);
  });

  it('should emit correct toggle values based on showDialog state', () => {
    const component = wrapper.componentInstance;
    const clickEvent = new MouseEvent('click');
    const submitEvent = new Event('submit');

    // Test multiple scenarios to verify the toggle logic
    component.showDialog = false;
    component.onClickSave(clickEvent);
    expect(wrapper.emitted('toggleDialog')![0][0]).toBe(true);

    component.showDialog = true;
    component.onSubmit(submitEvent);
    expect(wrapper.emitted('toggleDialog')![1][0]).toBe(false);

    component.showDialog = false;
    component.onSubmit(submitEvent);
    expect(wrapper.emitted('toggleDialog')![2][0]).toBe(true);
  });

  it('should pass different event types to saveChange emit', () => {
    const component = wrapper.componentInstance;

    const clickEvent = new MouseEvent('click');
    const submitEvent = new Event('submit');
    const customEvent = new CustomEvent('custom');

    component.onClickSave(clickEvent);
    component.onSubmit(submitEvent);
    component.onClickSave(customEvent);

    expect(wrapper.emitted('saveChange')![0][0]).toBe(clickEvent);
    expect(wrapper.emitted('saveChange')![1][0]).toBe(submitEvent);
    expect(wrapper.emitted('saveChange')![2][0]).toBe(customEvent);
  });

  it('should maintain component properties after method calls', () => {
    const component = wrapper.componentInstance;

    // Set initial state
    component.showDialog = true;
    component.heading = 'Test Heading';
    component.subheading = 'Test Subheading';
    component.width = 600;
    component.showHeader = false;
    component.showFooter = false;

    // Call methods
    component.onClickSave(new Event('click'));
    component.onSubmit(new Event('submit'));

    // Properties should remain unchanged (component doesn't modify its own state)
    expect(component.showDialog).toBe(true);
    expect(component.heading).toBe('Test Heading');
    expect(component.subheading).toBe('Test Subheading');
    expect(component.width).toBe(600);
    expect(component.showHeader).toBe(false);
    expect(component.showFooter).toBe(false);
  });

  it('should handle multiple rapid method calls', () => {
    const component = wrapper.componentInstance;
    const mockEvent = new Event('click');

    component.showDialog = false;

    // Call multiple times rapidly
    component.onClickSave(mockEvent);
    component.onClickSave(mockEvent);
    component.onSubmit(mockEvent);
    component.onClickSave(mockEvent);

    expect(wrapper.emitted('toggleDialog')).toHaveLength(4);
    expect(wrapper.emitted('saveChange')).toHaveLength(4);

    // All should emit true since showDialog remains false
    wrapper.emitted('toggleDialog')!.forEach(([value]) => {
      expect(value).toBe(true);
    });

    // All should emit the same event
    wrapper.emitted('saveChange')!.forEach(([event]) => {
      expect(event).toBe(mockEvent);
    });
  });

  it('should handle null and undefined events', () => {
    const component = wrapper.componentInstance;

    component.showDialog = false;

    // Test with null
    component.onClickSave(null as any);
    expect(wrapper.emitted('toggleDialog')![0][0]).toBe(true);
    expect(wrapper.emitted('saveChange')![0][0]).toBe(null);

    // Test with undefined
    component.onSubmit(undefined as any);
    expect(wrapper.emitted('toggleDialog')![1][0]).toBe(true);
    expect(wrapper.emitted('saveChange')![1][0]).toBe(undefined);
  });
});
