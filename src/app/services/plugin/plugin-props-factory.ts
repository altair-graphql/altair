import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { PluginInstance, PluginComponentDataProps, PluginComponentDataContext, isAppLevelPluginType } from './plugin';

import * as fromRoot from '../../reducers';

import * as queryActions from '../../actions/query/query';
import { of } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

interface GetPluginPropsOptions {
  windowId?: string;
  rootState?: fromRoot.State;
}

@Injectable()
export class PluginPropsFactory {
  ctx: PluginComponentDataContext;

  // SDL representing GraphQL schema for the current window
  sdl?: string;

  // Query for the current window
  query?: string;

  // Variables for the current window
  variables?: string;
  constructor(
    private store: Store<fromRoot.State>,
    private zone: NgZone,
  ) {}

  getPluginProps(plugin: PluginInstance, { windowId }: GetPluginPropsOptions = {}) {
    if (isAppLevelPluginType(plugin.type)) {
      return of({
        ctx: {
          setQuery: (_windowId: string, query: string) => this.zone.run(() => this.setQuery(_windowId, query)),
        }
      });
    } else {
      if (windowId) {
        return this.store.pipe(
          map(state => state.windows[windowId]),
          distinctUntilChanged(),
          map(windowState => {
            return {
              sdl: windowState.schema.sdl,
              query: windowState.query.query,
              ctx: {
                setQuery: (query: string) => this.zone.run(() => this.setQuery(windowId, query)),
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
}
