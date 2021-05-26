import { expect, describe, it } from '@jest/globals';
import { QueryEditorComponent } from './query-editor.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper, mount, mock } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GqlService, NotifyService } from '../../services';

describe('QueryEditorComponent', () => {
  let wrapper: NgxTestWrapper<QueryEditorComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: QueryEditorComponent,
      imports: [
        MockModule(SharedModule),
      ],
      providers: [
        {
          provide: GqlService,
          useValue: mock(),
        },
        {
          provide: NotifyService,
          useValue: mock(),
        },
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      propsData: {
        queryOperations: [],
      }
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should pass editor config to codemirror instance as options', () => {
    expect(wrapper.find('ngx-codemirror').props('options').mode).toBe('graphql');
  });

  it('should pass tabSize to variable editor component', async () => {
    wrapper.setProps({
      tabSize: 2,
      showVariableDialog: true,
    });

    await wrapper.nextTick();
    expect(wrapper.find('app-variables-editor').props('tabSize')).toBe(2);

    wrapper.setProps({
      tabSize: 4,
    });

    await wrapper.nextTick();
    expect(wrapper.find('app-variables-editor').props('tabSize')).toBe(4);
  });
});
