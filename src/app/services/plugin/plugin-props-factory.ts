import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { PluginInstance, isAppLevelPluginType, PluginComponentDataProps } from './plugin';
import { map, distinctUntilChanged } from 'rxjs/operators';

import * as fromRoot from '../../reducers';

import * as queryActions from '../../actions/query/query';
import * as variableActions from '../../actions/variables/variables';
import { Observable, Subscription } from 'rxjs';
import { WindowService } from '../window.service';
import { ExportWindowState } from 'app/reducers/windows';
import { PluginEventService, PluginEvent } from './plugin-event.service';
import is_electron from 'app/utils/is_electron';

interface GetPluginPropsOptions {
  windowId?: string;
}

type CreateWindowOptions = Pick<ExportWindowState, 'windowName' | 'apiUrl' | 'query' | 'headers' | 'variables' | 'subscriptionUrl'>

@Injectable()
export class PluginPropsFactory {
  constructor(
    private store: Store<fromRoot.State>,
    private zone: NgZone,
    private windowService: WindowService,
    private pluginEvent: PluginEventService,
  ) {}

  getPluginProps(plugin: PluginInstance, { windowId }: GetPluginPropsOptions = {}): Observable<PluginComponentDataProps> {
    if (isAppLevelPluginType(plugin.type)) {
      return this.store.pipe(
        distinctUntilChanged(),
        map(state => {
          return {
            ctx: {
              setQuery: (_windowId: string, query: string) => this.zone.run(() => this.setQuery(_windowId, query)),
              getQuery: (_windowId: string) => state.windows[_windowId].query.query || '',

              setVariables: (_windowId: string, variables: string) => this.zone.run(() => this.setVariables(_windowId, variables)),
              getVariables: (_windowId: string) => state.windows[_windowId].variables.variables,

              setEndpoint: (_windowId: string, endpoint: string) => this.zone.run(() => this.setEndpoint(_windowId, endpoint)),
              getEndpoint: (_windowId: string) => state.windows[_windowId].query.url,

              getSDL: (_windowId: string) => state.windows[_windowId].schema.sdl,

              createWindow: (options: CreateWindowOptions) => this.zone.run(() => this.createWindow(options)),

              on: (ev: PluginEvent, handler: () => Subscription) => this.pluginEvent.on(ev, handler),
              isElectron: () => is_electron,
            }
          };
        })
      );
    } else {
      if (windowId) {
        return this.store.pipe(
          map(state => state.windows[windowId]),
          distinctUntilChanged(),
          map(windowState => {
            return {
              sdl: windowState.schema.sdl,
              query: windowState.query.query,
              variables: windowState.variables.variables,
              ctx: {
                setQuery: (query: string) => this.zone.run(() => this.setQuery(windowId, query)),
                getQuery: () => windowState.query.query || '',

                setVariables: (variables: string) => this.zone.run(() => this.setVariables(windowId, variables)),
                getVariables: () => windowState.variables.variables,

                setEndpoint: (endpoint: string) => this.zone.run(() => this.setEndpoint(windowId, endpoint)),
                getEndpoint: () => windowState.query.url,

                getSDL: () => windowState.schema.sdl,

                on: (ev: PluginEvent, handler: () => Subscription) => this.pluginEvent.on(ev, handler),
                isElectron: () => is_electron,
              }
            }
          }),
        );
      }
      throw new Error('root state and window id are required for window-level plugins.');
    }
  }

  private setQuery(windowId: string, query: string) {
    this.store.dispatch(new queryActions.SetQueryAction(query, windowId));
  }

  private setVariables(windowId: string, variables: string) {
    this.store.dispatch(new variableActions.UpdateVariablesAction(variables, windowId));
  }

  private setEndpoint(windowId: string, url: string) {
    this.store.dispatch(new queryActions.SetUrlAction({ url }, windowId));
    this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(windowId));
  }

  private createWindow(windowData: CreateWindowOptions) {
    this.windowService.importWindowData({
      version: 1,
      type: 'window',
      ...windowData
    });
  }
}
