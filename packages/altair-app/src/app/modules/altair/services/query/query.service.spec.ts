import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { MockProvider } from 'ng-mocks';
import { mockStoreFactory } from '../../../../../testing';
import { EnvironmentService } from '../environment/environment.service';
import { NotifyService } from '../notify/notify.service';
import { PreRequestService } from '../pre-request/pre-request.service';
import { QueryCollectionService } from '../query-collection/query-collection.service';

import { QueryService } from './query.service';
import { GqlService } from '../gql/gql.service';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { HttpRequestHandler } from 'altair-graphql-core/build/request/handlers/http';
import { WebsocketRequestHandler } from 'altair-graphql-core/build/request/handlers/ws';
import {
  ACTION_CABLE_HANDLER_ID,
  GRAPHQL_SSE_HANDLER_ID,
} from 'altair-graphql-core/build/request/ids';
import { SSERequestHandler } from 'altair-graphql-core/build/request/handlers/sse';
import { ActionCableRequestHandler } from 'altair-graphql-core/build/request/handlers/action-cable';
import { FullTransformResult } from 'altair-graphql-core/build/script/types';

const makeWindowState = (overrides: Partial<PerWindowState> = {}): PerWindowState =>
  ({
    windowId: 'test-window',
    query: {
      url: 'http://localhost:3000/graphql',
      query: 'query { hello }',
      subscriptionUrl: '',
      subscriptionConnectionParams: '',
      requestExtensions: '',
      requestHandlerAdditionalParams: '',
      selectedOperation: '',
    },
    variables: { variables: '{}' },
    headers: [],
    preRequest: { enabled: false, script: '' },
    postRequest: { enabled: false, script: '' },
    authorization: { type: 'none', data: {} },
    ...overrides,
  }) as unknown as PerWindowState;

const makeTransformResult = (
  overrides: Partial<FullTransformResult> = {}
): FullTransformResult => ({
  combinedHeaders: [],
  requestScriptLogs: [],
  environment: {},
  ...overrides,
});

describe('QueryService', () => {
  let service: QueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(NotifyService),
        MockProvider(EnvironmentService, {
          hydrate(content) {
            return `HYDRATED[[${content}]]`;
          },
          hydrateHeaders(headers) {
            return headers;
          },
        }),
        MockProvider(PreRequestService),
        {
          provide: Store,
          useFactory: () => mockStoreFactory(),
        },
      ],
      teardown: { destroyAfterEach: false },
    });
    service = TestBed.inject(QueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('hydrateAllHydratables', () => {
    it('should hydrate all hydratables', () => {
      const hydratedContent = service.hydrateAllHydratables(
        {
          query: {
            url: 'http://localhost:3000/graphql',
            query: 'query { hello }',
            variables: '{ "name": "world" }',
            subscriptionConnectionParams: '{ "name": "world" }',
          },
          variables: {
            variables: '{ "name": "world" }',
          },
          headers: [
            {
              key: 'Content-Type',
              value: 'application/json',
              enabled: true,
            },
          ],
        } as unknown as PerWindowState,
        {
          combinedHeaders: [
            {
              key: 'Content-Type',
              value: 'application/json',
              enabled: true,
            },
          ],
          requestScriptLogs: [],
          environment: {},
        }
      );
      expect(hydratedContent).toEqual({
        extensions: 'HYDRATED[[]]',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
            enabled: true,
          },
        ],
        query: 'HYDRATED[[query { hello }]]',
        requestHandlerAdditionalParams: 'HYDRATED[[]]',
        subscriptionConnectionParams: 'HYDRATED[[{ "name": "world" }]]',
        subscriptionUrl: 'HYDRATED[[undefined]]',
        url: 'HYDRATED[[http://localhost:3000/graphql]]',
        variables: 'HYDRATED[[{ "name": "world" }]]',
      });
    });
    it('should hydrate with environment', () => {
      const hydratedContent = service.hydrateAllHydratables(
        {
          query: {
            url: 'http://localhost:3000/graphql',
            query: 'query { hello }',
            variables: '{ "name": "world" }',
            subscriptionConnectionParams: '{ "name": "world" }',
          },
          variables: {
            variables: '{ "name": "world" }',
          },
          headers: [
            {
              key: 'Content-Type',
              value: 'application/json',
              enabled: true,
            },
          ],
        } as unknown as PerWindowState,
        {
          combinedHeaders: [
            {
              key: 'Content-Type',
              value: 'application/json',
              enabled: true,
            },
          ],
          requestScriptLogs: [],
          environment: {
            x: 1,
          },
        }
      );
      expect(hydratedContent).toEqual({
        extensions: 'HYDRATED[[]]',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
            enabled: true,
          },
        ],
        query: 'HYDRATED[[query { hello }]]',
        requestHandlerAdditionalParams: 'HYDRATED[[]]',
        subscriptionConnectionParams: 'HYDRATED[[{ "name": "world" }]]',
        subscriptionUrl: 'HYDRATED[[undefined]]',
        url: 'HYDRATED[[http://localhost:3000/graphql]]',
        variables: 'HYDRATED[[{ "name": "world" }]]',
      });
    });
    it('should hydrate with combined headers', () => {
      const hydratedContent = service.hydrateAllHydratables(
        {
          query: {
            url: 'http://localhost:3000/graphql',
            query: 'query { hello }',
            variables: '{ "name": "world" }',
            subscriptionConnectionParams: '{ "name": "world" }',
          },
          variables: {
            variables: '{ "name": "world" }',
          },
          headers: [
            {
              key: 'Content-Type',
              value: 'application/json',
              enabled: true,
            },
          ],
        } as unknown as PerWindowState,
        {
          combinedHeaders: [
            {
              key: 'Authorization',
              value: 'Bearer token',
              enabled: true,
            },
          ],
          requestScriptLogs: [],
          environment: {},
        }
      );
      expect(hydratedContent).toEqual({
        extensions: 'HYDRATED[[]]',
        headers: [
          // combined headers is expected to be the final combined headers, so ignore the window headers
          {
            key: 'Authorization',
            value: 'Bearer token',
            enabled: true,
          },
        ],
        query: 'HYDRATED[[query { hello }]]',
        requestHandlerAdditionalParams: 'HYDRATED[[]]',
        subscriptionConnectionParams: 'HYDRATED[[{ "name": "world" }]]',
        subscriptionUrl: 'HYDRATED[[undefined]]',
        url: 'HYDRATED[[http://localhost:3000/graphql]]',
        variables: 'HYDRATED[[{ "name": "world" }]]',
      });
    });
  });

  describe('getRequestHandler', () => {
    it('should return HTTP handler as default query handler', async () => {
      const requestHandler = await service.getRequestHandler(
        {
          query: {
            url: 'http://localhost:3000/graphql',
            query: 'query { hello }',
            variables: '{ "name": "world" }',
            subscriptionConnectionParams: '{ "name": "world" }',
          },
          variables: {
            variables: '{ "name": "world" }',
          },
          headers: [
            {
              key: 'Content-Type',
              value: 'application/json',
              enabled: true,
            },
          ],
        } as unknown as PerWindowState,
        false
      );
      expect(requestHandler).toBeInstanceOf(HttpRequestHandler);
    });

    it('should return handler specified in requestHandlerId', async () => {
      const requestHandler = await service.getRequestHandler(
        {
          query: {
            url: 'http://localhost:3000/graphql',
            query: 'query { hello }',
            variables: '{ "name": "world" }',
            subscriptionConnectionParams: '{ "name": "world" }',
            requestHandlerId: GRAPHQL_SSE_HANDLER_ID,
          },
          variables: {
            variables: '{ "name": "world" }',
          },
          headers: [
            {
              key: 'Content-Type',
              value: 'application/json',
              enabled: true,
            },
          ],
        } as unknown as PerWindowState,
        false
      );
      expect(requestHandler).toBeInstanceOf(SSERequestHandler);
    });

    it('should return WS handler as default subscription handler', async () => {
      const requestHandler = await service.getRequestHandler(
        {
          query: {
            url: 'http://localhost:3000/graphql',
            query: 'subscription { hello }',
            variables: '{ "name": "world" }',
            subscriptionConnectionParams: '{ "name": "world" }',
          },
          variables: {
            variables: '{ "name": "world" }',
          },
          headers: [
            {
              key: 'Content-Type',
              value: 'application/json',
              enabled: true,
            },
          ],
        } as unknown as PerWindowState,
        true
      );
      expect(requestHandler).toBeInstanceOf(WebsocketRequestHandler);
    });

    it('should return handler specified in subscriptionRequestHandlerId for subscription', async () => {
      const requestHandler = await service.getRequestHandler(
        {
          query: {
            url: 'http://localhost:3000/graphql',
            query: 'subscription { hello }',
            variables: '{ "name": "world" }',
            subscriptionConnectionParams: '{ "name": "world" }',
            subscriptionRequestHandlerId: ACTION_CABLE_HANDLER_ID,
          },
          variables: {
            variables: '{ "name": "world" }',
          },
          headers: [
            {
              key: 'Content-Type',
              value: 'application/json',
              enabled: true,
            },
          ],
        } as unknown as PerWindowState,
        true
      );
      expect(requestHandler).toBeInstanceOf(ActionCableRequestHandler);
    });
  });

  describe('getPrerequestScriptResultForScript', () => {
    it('returns preTransformedData unchanged when window state is not found', async () => {
      jest.spyOn(service, 'getWindowState').mockResolvedValue(undefined);
      const preTransformedData = makeTransformResult({
        environment: { key: 'val' },
      });

      const result = await service.getPrerequestScriptResultForScript(
        'window-1',
        'console.log("test")',
        preTransformedData
      );

      expect(result).toBe(preTransformedData);
    });

    it('merges script result with preTransformedData when state exists', async () => {
      const state = makeWindowState();
      jest.spyOn(service, 'getWindowState').mockResolvedValue(state);

      const mockPreRequest = TestBed.inject(PreRequestService);
      jest.spyOn(mockPreRequest, 'executeScript').mockResolvedValue({
        environment: { newVar: 'newValue' },
        requestScriptLogs: [],
      });

      const preTransformedData = makeTransformResult({
        environment: { existing: 'yes' },
      });

      const result = await service.getPrerequestScriptResultForScript(
        'window-1',
        'altair.helpers.setEnvironment("newVar", "newValue");',
        preTransformedData
      );

      expect(result.environment).toMatchObject({ newVar: 'newValue' });
    });

    it('returns preTransformedData and shows error when script execution fails', async () => {
      const state = makeWindowState();
      jest.spyOn(service, 'getWindowState').mockResolvedValue(state);

      const mockPreRequest = TestBed.inject(PreRequestService);
      jest
        .spyOn(mockPreRequest, 'executeScript')
        .mockRejectedValue(new Error('Script error'));

      const mockNotify = TestBed.inject(NotifyService);
      const errorSpy = jest.spyOn(mockNotify, 'error');

      const preTransformedData = makeTransformResult();

      const result = await service.getPrerequestScriptResultForScript(
        'window-1',
        'bad script',
        preTransformedData
      );

      expect(result).toBe(preTransformedData);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('getPostRequestTransformedDataForScript', () => {
    it('returns preTransformedData unchanged when window state is not found', async () => {
      jest.spyOn(service, 'getWindowState').mockResolvedValue(undefined);
      const preTransformedData = makeTransformResult();

      const result = await service.getPostRequestTransformedDataForScript(
        'window-1',
        'console.log("test")',
        'query' as any,
        {} as any,
        preTransformedData
      );

      expect(result).toBe(preTransformedData);
    });

    it('merges script result with preTransformedData when state exists', async () => {
      const state = makeWindowState();
      jest.spyOn(service, 'getWindowState').mockResolvedValue(state);

      const mockPreRequest = TestBed.inject(PreRequestService);
      jest.spyOn(mockPreRequest, 'executeScript').mockResolvedValue({
        environment: { postVar: 'postValue' },
        requestScriptLogs: [],
      });

      const preTransformedData = makeTransformResult();

      const result = await service.getPostRequestTransformedDataForScript(
        'window-1',
        'some script',
        'query' as any,
        {} as any,
        preTransformedData
      );

      expect(result.environment).toMatchObject({ postVar: 'postValue' });
    });

    it('returns preTransformedData and shows error when script execution fails', async () => {
      const state = makeWindowState();
      jest.spyOn(service, 'getWindowState').mockResolvedValue(state);

      const mockPreRequest = TestBed.inject(PreRequestService);
      jest
        .spyOn(mockPreRequest, 'executeScript')
        .mockRejectedValue(new Error('Post script error'));

      const mockNotify = TestBed.inject(NotifyService);
      const errorSpy = jest.spyOn(mockNotify, 'error');

      const preTransformedData = makeTransformResult();

      const result = await service.getPostRequestTransformedDataForScript(
        'window-1',
        'bad post script',
        'query' as any,
        {} as any,
        preTransformedData
      );

      expect(result).toBe(preTransformedData);
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
