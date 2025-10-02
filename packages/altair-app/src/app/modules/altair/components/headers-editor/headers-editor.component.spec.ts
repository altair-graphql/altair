import { HeadersEditorComponent } from './headers-editor.component';
import { mount, NgxTestWrapper } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { SharedModule } from '../../modules/shared/shared.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeadersEditorComponent', () => {
  let wrapper: NgxTestWrapper<HeadersEditorComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: HeadersEditorComponent,
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
});
