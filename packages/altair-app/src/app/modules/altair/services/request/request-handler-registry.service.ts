import { Injectable } from '@angular/core';
import {
  ACTION_CABLE_HANDLER_ID,
  APP_SYNC_HANDLER_ID,
  GRAPHQL_SSE_HANDLER_ID,
  GRAPHQL_WS_HANDLER_ID,
  HTTP_HANDLER_ID,
  WEBSOCKET_HANDLER_ID,
} from 'altair-graphql-core/build/request/ids';
import { RequestHandlerData } from 'altair-graphql-core/build/request/types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestHandlerRegistryService {
  private list: RequestHandlerData[] = [];
  private list$ = new BehaviorSubject(this.list);
  constructor() {
    this.addHandlerData({
      id: HTTP_HANDLER_ID,
      async getHandler() {
        const HttpHandler = (
          await import('altair-graphql-core/build/request/handlers/http')
        ).HttpRequestHandler;
        return new HttpHandler();
      },
      copyTag: 'REQUEST_HANDLER_HTTP',
    });
    this.addHandlerData({
      id: WEBSOCKET_HANDLER_ID,
      async getHandler() {
        const WsHandler = (
          await import('altair-graphql-core/build/request/handlers/ws')
        ).WebsocketRequestHandler;
        return new WsHandler();
      },
      copyTag: 'REQUEST_HANDLER_WEBSOCKET',
    });

    this.addHandlerData({
      id: GRAPHQL_WS_HANDLER_ID,
      async getHandler() {
        const WsHandler = (
          await import('altair-graphql-core/build/request/handlers/graphql-ws')
        ).GraphQLWsRequestHandler;
        return new WsHandler();
      },
      copyTag: 'REQUEST_HANDLER_GRAPHQL_WS',
    });

    this.addHandlerData({
      id: APP_SYNC_HANDLER_ID,
      async getHandler() {
        const AppSyncHandler = (
          await import('altair-graphql-core/build/request/handlers/app-sync')
        ).AppSyncRequestHandler;
        return new AppSyncHandler();
      },
      copyTag: 'REQUEST_HANDLER_APP_SYNC',
    });

    this.addHandlerData({
      id: ACTION_CABLE_HANDLER_ID,
      async getHandler() {
        const ActionCableHandler = (
          await import('altair-graphql-core/build/request/handlers/action-cable')
        ).ActionCableRequestHandler;
        return new ActionCableHandler();
      },
      copyTag: 'REQUEST_HANDLER_ACTION_CABLE',
    });

    this.addHandlerData({
      id: GRAPHQL_SSE_HANDLER_ID,
      async getHandler() {
        const SseHandler = (
          await import('altair-graphql-core/build/request/handlers/sse')
        ).SSERequestHandler;
        return new SseHandler();
      },
      copyTag: 'REQUEST_HANDLER_GRAPHQL_SSE',
    });
  }

  addHandlerData(handlerData: RequestHandlerData) {
    this.list.push(handlerData);
    this.list$.next(this.list);
  }

  getHandlerData(handlerId: string) {
    const handlerData = this.list.find((_) => _.id === handlerId);
    if (!handlerData) {
      throw new Error(`No request handler found for "${handlerId}"`);
    }

    return handlerData;
  }

  getAllHandlerData() {
    return this.list;
  }

  getAllHandlerData$() {
    // return a new observable each time to separate the subscriptions
    return this.list$.asObservable();
  }
}
