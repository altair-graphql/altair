import { expect, describe, it } from '@jest/globals';
import { HistoryDialogComponent } from './history-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing/utils';
import { MockModule, MockComponent } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HistoryDialogComponent', () => {
  let wrapper: NgxTestWrapper<HistoryDialogComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: HistoryDialogComponent,
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
