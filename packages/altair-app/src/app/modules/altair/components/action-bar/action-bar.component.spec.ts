import { expect } from '@jest/globals';
import { ActionBarComponent } from './action-bar.component';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing/utils';
import { SharedModule } from '../../modules/shared/shared.module';
import { MockModule } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ActionBarComponent', () => {
  let wrapper: NgxTestWrapper<ActionBarComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: ActionBarComponent,
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

  it('should emit prettifyCodeChange event when the Prettify Code button is clicked', async () => {
    const button = wrapper.find('button.app-button').at(0); // Assuming it's the first button
    button.trigger('click');
    await wrapper.nextTick();
    expect(wrapper.emitted('prettifyCodeChange')).toBeTruthy();
  });

  it('should emit clearEditorChange event when the Clear Editor button is clicked', async () => {
    const button = wrapper.find('button.app-button').at(1); // Assuming it's the second button
    button.trigger('click');
    await wrapper.nextTick();
    expect(wrapper.emitted('clearEditorChange')).toBeTruthy();
  });

  it('should emit toggleHeaderDialog event when the Set Headers button is clicked', async () => {
    const button = wrapper.find('button.app-button').at(2); // Adjust index as needed
    button.trigger('click');
    await wrapper.nextTick();
    expect(wrapper.emitted('toggleHeaderDialog')).toBeTruthy();
  });

  it('should emit toggleVariableDialog event when the Set Variables button is clicked', async () => {
    const button = wrapper.find('button.app-button').at(3); // Adjust index as needed
    button.trigger('click');
    await wrapper.nextTick();
    expect(wrapper.emitted('toggleVariableDialog')).toBeTruthy();
  });

  it('should emit reloadDocsChange event when the Reload Docs button is clicked', async () => {
    const button = wrapper.find('button.app-button').at(5); // Adjust index as needed
    button.trigger('click');
    await wrapper.nextTick();
    expect(wrapper.emitted('reloadDocsChange')).toBeTruthy();
  });

  it('should apply active-grey class to Show Docs button when showDocs is true', async () => {
    wrapper.setProps({ showDocs: true });
    await wrapper.nextTick();
    const button = wrapper.find('button.app-button').at(6); // Adjust index as needed
    expect(button.classes()).toContain('active-grey');
  });
});
