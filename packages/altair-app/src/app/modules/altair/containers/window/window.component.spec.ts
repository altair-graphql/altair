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
import { MockService } from 'ng-mocks';

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
      },
      settings: {
        theme: 'light',
        addQueryDepthLimit: 2,
        language: 'en-US',
        tabSize: 2,
      },
      local: {
        closedWindows: [],
        installedPlugins: {},
        panels: [],
        uiActions: [],
      },
      collection: {
        activeCollection: undefined,
        list: [],
      },
      environments: {
        base: {
          variablesJson: '{}',
        },
        subEnvironments: [],
      },
    });
    const providers = [
      {
        provide: Store,
        useValue: mockStore,
      },
      {
        provide: services.GqlService,
        useFactory: () => MockService(services.GqlService),
      },
      {
        provide: services.NotifyService,
        useFactory: () => MockService(services.NotifyService),
      },
      {
        provide: services.WindowService,
        useFactory: () =>
          mock({
            setupWindow: anyFn(),
          }),
      },
      {
        provide: services.PluginRegistryService,
        useFactory: () => MockService(services.PluginRegistryService),
      },
      {
        provide: services.RequestHandlerRegistryService,
        useFactory: () =>
          mock<services.RequestHandlerRegistryService>({
            getAllHandlerData: jest.fn(),
            getAllHandlerData$: jest.fn(),
          }),
      },
    ];
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [WindowComponent],
      providers: providers,
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('windowId', 'abc-123');
    // eslint-disable-next-line @angular-eslint/require-lifecycle-on-prototype
    component.ngOnInit = () => {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('clearResult', () => {
    it('should dispatch ClearResultAction', () => {
      component.clearResult();

      const expectedAction = new ClearResultAction(component.windowId());

      expect(mockStore.dispatch).toHaveBeenCalledWith(expectedAction);
    });
  });
});
