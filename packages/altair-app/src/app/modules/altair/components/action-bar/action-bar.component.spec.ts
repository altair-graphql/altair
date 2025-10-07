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

  it('should emit prettifyCodeChange event when Prettify button is clicked', () => {
    const prettifyButton = wrapper.find('.prettify-button');
    prettifyButton.emit('click');
    expect(wrapper.emitted('prettifyCodeChange')).toBeTruthy();
  });

  it('should emit clearEditorChange event when Clear Editor button is clicked', () => {
    const clearButton = wrapper.find('.clear-editor-button');
    clearButton.emit('click');
    expect(wrapper.emitted('clearEditorChange')).toBeTruthy();
  });

  it('should emit toggleHeaderDialog event when Set Headers button is clicked', () => {
    const setHeadersButton = wrapper.find('.set-headers-button');
    setHeadersButton.emit('click');
    expect(wrapper.emitted('toggleHeaderDialog')).toBeTruthy();
  });

  it('should emit toggleVariableDialog event when Set Variables button is clicked', () => {
    const setVariablesButton = wrapper.find('.set-variables-button');
    setVariablesButton.emit('click');
    expect(wrapper.emitted('toggleVariableDialog')).toBeTruthy();
  });

  it('should emit toggleSubscriptionUrlDialog event when Set Subscription URL button is clicked', () => {
    const setSubscriptionUrlButton = wrapper.find('.set-subscription-url-button');
    setSubscriptionUrlButton.emit('click');
    expect(wrapper.emitted('toggleSubscriptionUrlDialog')).toBeTruthy();
  });

  it('should emit reloadDocsChange event when Reload Docs button is clicked', () => {
    const reloadDocsButton = wrapper.find('.reload-docs-button');
    reloadDocsButton.emit('click');
    expect(wrapper.emitted('reloadDocsChange')).toBeTruthy();
  });

  it('should emit toggleDocsChange event when Show Docs button is clicked', () => {
    const showDocsButton = wrapper.find('.show-docs-button');
    showDocsButton.emit('click');
    expect(wrapper.emitted('toggleDocsChange')).toBeTruthy();
  });
});
