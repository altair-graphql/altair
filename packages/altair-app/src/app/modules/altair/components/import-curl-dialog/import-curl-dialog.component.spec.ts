import { expect, describe, it } from '@jest/globals';

import { ImportCurlDialogComponent } from './import-curl-dialog.component';

import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ImportCurlDialogComponent', () => {
  let wrapper: NgxTestWrapper<ImportCurlDialogComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: ImportCurlDialogComponent,
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
