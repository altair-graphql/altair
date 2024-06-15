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
        MockProvider(GqlService),
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
});
