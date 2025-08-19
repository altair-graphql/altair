import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { MockProvider } from 'ng-mocks';
import { mockStoreFactory } from '../../../../../testing';
import { EnvironmentService } from '../environment/environment.service';
import { NotifyService } from '../notify/notify.service';
import { PreRequestService } from '../pre-request/pre-request.service';
import { QueryCollectionService } from '../query-collection/query-collection.service';
import { RequestHandlerRegistryService } from '../request/request-handler-registry.service';

import { QueryService } from './query.service';
import { GqlService } from '../gql/gql.service';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { HttpRequestHandler } from 'altair-graphql-core/build/request/handlers/http';
import { WebsocketRequestHandler } from 'altair-graphql-core/build/request/handlers/ws';
import {
  ACTION_CABLE_HANDLER_ID,
  GRAPHQL_SSE_HANDLER_ID,
  HTTP_HANDLER_ID,
} from 'altair-graphql-core/build/request/types';
import { SSERequestHandler } from 'altair-graphql-core/build/request/handlers/sse';
import { ActionCableRequestHandler } from 'altair-graphql-core/build/request/handlers/action-cable';

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
        MockProvider(QueryCollectionService),
        MockProvider(GqlService, {
          hasInvalidFileVariable: jest.fn().mockReturnValue(false),
        }),
        MockProvider(RequestHandlerRegistryService),
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
      const hydratedContent = service.hydrateAllHydratables({
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
      } as unknown as PerWindowState);
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
          additionalHeaders: [],
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
    it('should hydrate with additional headers', () => {
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
          additionalHeaders: [
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
          {
            key: 'Content-Type',
            value: 'application/json',
            enabled: true,
          },
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

  describe('validateQueryRequest', () => {
    it('should return valid result for valid URL, variables, and files', () => {
      const result = service.validateQueryRequest(
        'http://localhost:3000/graphql',
        '{"name": "world"}',
        []
      );
      expect(result).toEqual({ isValid: true });
    });

    it('should return invalid result for empty URL', () => {
      const result = service.validateQueryRequest(
        '',
        '{"name": "world"}',
        []
      );
      expect(result).toEqual({
        isValid: false,
        errorMessage: 'The URL is invalid!',
      });
    });

    it('should return invalid result for invalid URL', () => {
      const result = service.validateQueryRequest(
        'not-a-url',
        '{"name": "world"}',
        []
      );
      expect(result).toEqual({
        isValid: false,
        errorMessage: 'The URL is invalid!',
      });
    });

    it('should return invalid result for invalid JSON variables', () => {
      const result = service.validateQueryRequest(
        'http://localhost:3000/graphql',
        '{"name": world}', // invalid JSON
        []
      );
      expect(result).toEqual({
        isValid: false,
        errorMessage: 'The variables is not a valid JSON string!',
      });
    });

    it('should return invalid result for invalid file variables', () => {
      const mockGqlService = TestBed.inject(GqlService);
      jest.spyOn(mockGqlService, 'hasInvalidFileVariable').mockReturnValue(true);

      const result = service.validateQueryRequest(
        'http://localhost:3000/graphql',
        '{"name": "world"}',
        [{ file: null, name: 'test' }] // invalid file
      );
      expect(result).toEqual({
        isValid: false,
        errorMessage: expect.stringContaining('invalid file variables'),
      });
    });
  });
});
