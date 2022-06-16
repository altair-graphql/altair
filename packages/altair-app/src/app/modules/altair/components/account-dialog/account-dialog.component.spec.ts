import { describe, expect, it } from '@jest/globals';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { mount, NgxTestWrapper } from '../../../../../testing';
import { SharedModule } from '../../modules/shared/shared.module';

import { AccountDialogComponent } from './account-dialog.component';

describe('AccountDialogComponent', () => {
  let wrapper: NgxTestWrapper<AccountDialogComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: AccountDialogComponent,
      declarations: [AccountDialogComponent],
      providers: [],
      imports: [SharedModule],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('should create', () => {
    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });
});
