import { describe, expect, it } from '@jest/globals';

import { VariableFileItemComponent } from './variable-file-item.component';
import { NgxTestWrapper, mount, mock } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { SharedModule } from '../../modules/shared/shared.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StorageService } from '../../services';

describe('VariableFileItemComponent', () => {
  let wrapper: NgxTestWrapper<VariableFileItemComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: VariableFileItemComponent,
      imports: [
        MockModule(SharedModule),
      ],
      providers: [
        {
          provide: StorageService,
          useValue: mock(),
        }
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
