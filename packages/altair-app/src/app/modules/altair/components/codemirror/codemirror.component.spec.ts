import { CodemirrorComponent } from './codemirror.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockModule } from 'ng-mocks';
import { SharedModule } from '../../modules/shared/shared.module';
import { mount } from '../../../../../testing/utils';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { AltairConfig } from 'altair-graphql-core/build/config';

describe('CodemirrorComponent', () => {
  let wrapper: NgxTestWrapper<CodemirrorComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: CodemirrorComponent,
      imports: [MockModule(SharedModule), AltairConfig],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });
});
