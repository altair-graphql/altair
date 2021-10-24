import { expect, describe, it, beforeEach } from '@jest/globals';
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
import { SubscriptionProviderRegistryService } from '../../subscriptions/subscription-provider-registry.service';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { AltairPlugin } from 'altair-graphql-core/build/plugin/plugin.interfaces';

const createContext = () => {
  const service: PluginContextService = TestBed.inject(PluginContextService);
    const testPlugin: AltairPlugin = {
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
      }
    };
    return service.createContext('test-plugin', testPlugin);
};

describe('PluginContextService', () => {
  let mockStore: Store<RootState>;
  beforeEach(() => {
    mockStore = mockStoreFactory<RootState>({
      windows: {
        'abc-123': getInitWindowState(combineReducers(getPerWindowReducer())),
        'def-456': getInitWindowState(combineReducers(getPerWindowReducer())),
      },
      windowsMeta: {
        ...windowsMetaReducer.getInitialState(),
        activeWindowId: 'def-456',
      }
    });
  });
  beforeEach(() => TestBed.configureTestingModule({
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
        useFactory: () => mock(),
      },
      {
        provide: PluginEventService,
        useFactory: () => mock<PluginEventService>({
          group: () => ({} as unknown as any),
        }),
      },
      {
        provide: SubscriptionProviderRegistryService,
        useFactory: () => mock(),
      },
    ]
  }));

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
        expect(windowState.windowId).toEqual('abc-123');
      });
    });

    describe('getCurrentWindowState', () => {
      it('should return window state for the currently active window', async () => {
        const ctx = createContext();
        const windowState = await ctx.app.getCurrentWindowState();
        expect(windowState.windowId).toEqual('def-456');
      });
    });

    describe('createPanel', () => {
      it('should return new panel', () => {
        const ctx = createContext();
        const element = document.createElement('div')
        const panel = ctx.app.createPanel(element);
        expect(panel).toEqual(expect.objectContaining({
          element,
          id: expect.any(String),
          isActive: false,
          location: 'sidebar',
          title: 'Test plugin'
        }));
      });
      it('should dispatch AddPanelAction for new panel', () => {
        const ctx = createContext();
        const element = document.createElement('div')
        ctx.app.createPanel(element);
        expect(mockStore.dispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: {
            element,
            id: expect.any(String),
            isActive: false,
            location: 'sidebar',
            title: 'Test plugin'
          },
          type: 'ADD_PANEL',
        }));
      });
    });

    describe('destroyPanel', () => {
      it('should dispatch RemovePanelAction for given panel', () => {
        const ctx = createContext();
        const element = document.createElement('div')
        const panel = ctx.app.createPanel(element);

        ctx.app.destroyPanel(panel);

        expect(mockStore.dispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: {
            panelId: panel.id,
          },
          type: 'REMOVE_PANEL',
        }));
      });
    });

    describe('createAction', () => {
      it('should return new action', () => {
        const ctx = createContext();
        const action = ctx.app.createAction({
          title: 'Test action',
          execute: () => {},
        });
        expect(action).toEqual(expect.objectContaining({
          callback: expect.any(Function),
          id: expect.any(String),
          location: 'result_pane',
          title: 'Test action'
        }));
      });
      it('should dispatch AddPanelAction for new action', () => {
        const ctx = createContext();
        ctx.app.createAction({
          title: 'Test action',
          execute: () => {},
        });
        expect(mockStore.dispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: {
            callback: expect.any(Function),
            id: expect.any(String),
            location: 'result_pane',
            title: 'Test action'
          },
          type: 'ADD_UI_ACTION',
        }));
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

        expect(mockStore.dispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: {
            actionId: action.id,
          },
          type: 'REMOVE_UI_ACTION',
        }));
      });
    });
  });
});
