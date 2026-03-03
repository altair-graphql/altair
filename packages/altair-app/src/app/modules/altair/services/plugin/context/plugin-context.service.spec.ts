import { TestBed } from '@angular/core/testing';

import { PluginContextService } from './plugin-context.service';
import { combineReducers, Store } from '@ngrx/store';
import { mockStoreFactory, mock } from '../../../../../../testing';
import { getPerWindowReducer } from '../../../store';
import { getInitWindowState } from '../../../store/windows/windows.reducer';
import * as windowsMetaReducer from '../../../store/windows-meta/windows-meta.reducer';
import { WindowService } from '../../../services/window.service';
import { PluginEventService } from '../plugin-event.service';
import { NotifyService } from '../../../services/notify/notify.service';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { AltairV1Plugin } from 'altair-graphql-core/build/plugin/plugin.interfaces';
import { RequestHandlerRegistryService } from '../../request/request-handler-registry.service';
import { ThemeRegistryService } from '../../../services/theme/theme-registry.service';
import { ICustomTheme } from 'altair-graphql-core/build/theme';

const createContext = () => {
  const service: PluginContextService = TestBed.inject(PluginContextService);
  const testPlugin: AltairV1Plugin = {
    name: 'Test',
    display_name: 'Test plugin',
    capabilities: [],
    manifest: {
      manifest_version: 2,
      name: 'Test',
      description: 'plugin description',
      display_name: 'Test plugin',
      scripts: [],
      version: '0.0.1',
    },
  };
  return service.createV1Context('test-plugin', testPlugin);
};

describe('PluginContextService', () => {
  let mockStore: Store<RootState>;
  let mockEventBus: { on: import('vitest').Mock; unsubscribe: import('vitest').Mock };
  beforeEach(() => {
    mockEventBus = { on: vi.fn(), unsubscribe: vi.fn() };
    mockStore = mockStoreFactory<RootState>({
      windows: {
        'abc-123': getInitWindowState(combineReducers(getPerWindowReducer())),
        'def-456': getInitWindowState(combineReducers(getPerWindowReducer())),
      },
      windowsMeta: {
        ...windowsMetaReducer.getInitialState(),
        activeWindowId: 'def-456',
      },
    });
  });
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Store,
          useValue: mockStore,
        },
        {
          provide: WindowService,
          useFactory: () => mock(),
        },
        {
          provide: NotifyService,
          useFactory: () => mock<NotifyService>({ info: vi.fn() }),
        },
        {
          provide: PluginEventService,
          useFactory: () =>
            mock<PluginEventService>({
              group: () => mockEventBus as any,
            }),
        },
        {
          provide: RequestHandlerRegistryService,
          useFactory: () => mock(),
        },
        {
          provide: ThemeRegistryService,
          useFactory: () =>
            mock<ThemeRegistryService>({
              addTheme: vi.fn(),
              getTheme: vi.fn(),
              mergeThemes: vi.fn().mockReturnValue({}),
            }),
        },
      ],
      teardown: { destroyAfterEach: false },
    });
  });

  it('should be created', () => {
    const service: PluginContextService = TestBed.inject(PluginContextService);
    expect(service).toBeTruthy();
  });

  it('should create context for specified plugin', () => {
    const ctx = createContext();
    expect(ctx).toBeTruthy();
    expect(ctx.app).toBeTruthy();
    expect(ctx.events).toBeTruthy();
    expect(ctx.theme).toBeTruthy();
  });

  describe('ctx.app', () => {
    describe('getWindowState', () => {
      it('should return window state for the given window id', async () => {
        const ctx = createContext();
        const windowState = await ctx.app.getWindowState('abc-123');
        expect(windowState!.windowId).toEqual('abc-123');
      });
    });

    describe('getCurrentWindowState', () => {
      it('should return window state for the currently active window', async () => {
        const ctx = createContext();
        const windowState = await ctx.app.getCurrentWindowState();
        expect(windowState!.windowId).toEqual('def-456');
      });
    });

    describe('setHeader', () => {
      it('should dispatch set header action', async () => {
        const ctx = createContext();
        const windowState = await ctx.app.getCurrentWindowState();
        const currentWindowId = windowState!.windowId;
        await ctx.app.setHeader(currentWindowId, 'x-test-header', 'test-value');
        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: {
              headers: [
                { enabled: true, key: 'x-test-header', value: 'test-value' },
              ],
            },
            type: 'SET_HEADERS',
            windowId: 'def-456',
          })
        );
      });
    });

    describe('createPanel', () => {
      it('should return new panel', () => {
        const ctx = createContext();
        const element = document.createElement('div');
        const panel = ctx.app.createPanel(element);
        expect(panel).toEqual(
          expect.objectContaining({
            element,
            id: expect.any(String),
            isActive: false,
            location: 'sidebar',
            title: 'Test plugin',
          })
        );
      });
      it('should dispatch AddPanelAction for new panel', () => {
        const ctx = createContext();
        const element = document.createElement('div');
        ctx.app.createPanel(element);
        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: {
              element,
              id: expect.any(String),
              isActive: false,
              location: 'sidebar',
              title: 'Test plugin',
            },
            type: 'ADD_PANEL',
          })
        );
      });
    });

    describe('destroyPanel', () => {
      it('should dispatch RemovePanelAction for given panel', () => {
        const ctx = createContext();
        const element = document.createElement('div');
        const panel = ctx.app.createPanel(element);

        ctx.app.destroyPanel(panel);

        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: {
              panelId: panel.id,
            },
            type: 'REMOVE_PANEL',
          })
        );
      });
    });

    describe('createAction', () => {
      it('should return new action', () => {
        const ctx = createContext();
        const action = ctx.app.createAction({
          title: 'Test action',
          execute: () => {},
        });
        expect(action).toEqual(
          expect.objectContaining({
            callback: expect.any(Function),
            id: expect.any(String),
            location: 'result_pane',
            title: 'Test action',
          })
        );
      });
      it('should dispatch AddPanelAction for new action', () => {
        const ctx = createContext();
        ctx.app.createAction({
          title: 'Test action',
          execute: () => {},
        });
        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: {
              callback: expect.any(Function),
              id: expect.any(String),
              location: 'result_pane',
              title: 'Test action',
            },
            type: 'ADD_UI_ACTION',
          })
        );
      });
    });

    describe('destroyAction', () => {
      it('should dispatch RemovePanelAction for given action', () => {
        const ctx = createContext();
        const action = ctx.app.createAction({
          title: 'Test action',
          execute: () => {},
        });

        ctx.app.destroyAction(action);

        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: {
              actionId: action.id,
            },
            type: 'REMOVE_UI_ACTION',
          })
        );
      });
    });

    describe('setQuery', () => {
      it('should dispatch SetQueryAction with the given query', () => {
        const ctx = createContext();
        ctx.app.setQuery('abc-123', 'query { user { id } }');
        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'SET_QUERY',
            windowId: 'abc-123',
          })
        );
      });
    });

    describe('setVariables', () => {
      it('should dispatch UpdateVariablesAction with the given variables', () => {
        const ctx = createContext();
        ctx.app.setVariables('abc-123', '{"id": "1"}');
        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'UPDATE_VARIABLES',
            windowId: 'abc-123',
          })
        );
      });
    });

    describe('setEndpoint', () => {
      it('should dispatch SetUrlAction and SendIntrospectionQueryRequestAction', () => {
        const ctx = createContext();
        ctx.app.setEndpoint('abc-123', 'http://example.com/graphql');
        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'SET_URL',
            windowId: 'abc-123',
          })
        );
        expect(mockStore.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'SEND_INTROSPECTION_QUERY_REQUEST',
            windowId: 'abc-123',
          })
        );
      });
    });

    describe('createWindow', () => {
      it('should call windowService.importWindowData', () => {
        const ctx = createContext();
        const windowService = TestBed.inject(WindowService) as any;
        windowService.importWindowData = vi.fn();
        ctx.app.createWindow({ version: 1, type: 'window' } as any);
        expect(windowService.importWindowData).toHaveBeenCalled();
      });
    });

    describe('isElectron', () => {
      it('should return a boolean', () => {
        const ctx = createContext();
        const result = ctx.app.isElectron();
        expect(typeof result).toBe('boolean');
      });
    });

    describe('addSubscriptionProvider', () => {
      it('should call requestHandlerRegistryService.addHandlerData', () => {
        const ctx = createContext();
        const registryService = TestBed.inject(RequestHandlerRegistryService) as any;
        registryService.addHandlerData = vi.fn();
        ctx.app.addSubscriptionProvider({
          id: 'test-provider',
          getProviderClass: vi.fn().mockResolvedValue(class {}),
          copyTag: 'TEST',
        } as any);
        expect(registryService.addHandlerData).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'test-provider' })
        );
      });
    });
  });
});
