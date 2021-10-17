import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store, combineReducers } from '@ngrx/store';

import * as services from './../../services';
import { WindowComponent } from './window.component';
import { mock, anyFn, mockStoreFactory } from '../../../../../testing';
import { TranslateModule } from '@ngx-translate/core';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { ClearResultAction } from '../../store/query/query.action';
import { getInitWindowState } from '../../store/windows/windows.reducer';
import { getPerWindowReducer } from '../../store';
import * as windowsMetaReducer from '../../store/windows-meta/windows-meta.reducer';

describe('WindowComponent', () => {
  let component: WindowComponent;
  let fixture: ComponentFixture<WindowComponent>;
  let mockStore: Store<RootState>;

  beforeEach(waitForAsync(() => {

    mockStore = mockStoreFactory<RootState>({
      windows: {
        'abc-123': getInitWindowState(combineReducers(getPerWindowReducer())),
      },
      windowsMeta: {
        ...windowsMetaReducer.getInitialState(),
        activeWindowId: 'abc-123',
      }
    });
    const providers = [
      {
        provide: Store,
        useValue: mockStore,
      },
      {
        provide: services.GqlService,
        useFactory: () => mock(),
      },
      {
        provide: services.NotifyService,
        useFactory: () => mock(),
      },
      {
        provide: services.WindowService,
        useFactory: () => mock({
          setupWindow: anyFn(),
        }),
      },
      {
        provide: services.PluginRegistryService,
        useFactory: () => mock(),
      },
      {
        provide: services.SubscriptionProviderRegistryService,
        useFactory: () => mock<services.SubscriptionProviderRegistryService>({
          getAllProviderData: jest.fn(),
          getAllProviderData$: jest.fn(),
        }),
      },
    ];
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      declarations: [ WindowComponent ],
      providers: providers,
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowComponent);
    component = fixture.componentInstance;
    component.ngOnInit = () => {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('clearResult', () => {
    it('should dispatch ClearResultAction', () => {
      component.clearResult();

      const expectedAction = new ClearResultAction(component.windowId)

      expect(mockStore.dispatch).toHaveBeenCalledWith(expectedAction);
    })
  });
});
