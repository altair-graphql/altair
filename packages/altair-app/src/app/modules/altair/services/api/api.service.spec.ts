import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { AccountService } from '../account/account.service';

import { ApiService, serverCollectionToLocalCollection } from './api.service';
import { FullQueryCollection } from '@altairgraphql/api-utils';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(AccountService)],
      teardown: { destroyAfterEach: false },
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('serverCollectionToLocalCollection', () => {
  it('should convert a server collection with all fields to local collection', () => {
    const serverCollection: FullQueryCollection = {
      id: 'collection-123',
      name: 'My Test Collection',
      description: 'This is a test collection',
      workspaceId: 'workspace-456',
      preRequestScript: 'console.log("pre-request");',
      preRequestScriptEnabled: true,
      postRequestScript: 'console.log("post-request");',
      postRequestScriptEnabled: false,
      headers: [
        { key: 'Authorization', value: 'Bearer token123' },
        { key: 'Content-Type', value: 'application/json' },
      ],
      environmentVariables: {
        API_URL: 'https://api.example.com',
        API_KEY: 'secret-key',
      },
      queries: [
        {
          id: 'query-1',
          queryVersion: 1,
          name: 'Get Users',
          collectionId: 'collection-123',
          content: {
            windowName: 'Get Users',
            query: '{ users { id name } }',
          },
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        },
        {
          id: 'query-2',
          queryVersion: 1,
          name: 'Get Posts',
          collectionId: 'collection-123',
          content: {
            windowName: 'Get Posts',
            query: '{ posts { id title } }',
          },
          createdAt: new Date('2023-01-03T00:00:00Z'),
          updatedAt: new Date('2023-01-04T00:00:00Z'),
        },
      ],
      parentCollectionId: null,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    const result = serverCollectionToLocalCollection(serverCollection);

    expect(result).toEqual({
      id: 'collection-123',
      title: 'My Test Collection',
      description: 'This is a test collection',
      workspaceId: 'workspace-456',
      storageType: 'api',
      preRequest: {
        script: 'console.log("pre-request");',
        enabled: true,
      },
      postRequest: {
        script: 'console.log("post-request");',
        enabled: false,
      },
      headers: [
        { key: 'Authorization', value: 'Bearer token123' },
        { key: 'Content-Type', value: 'application/json' },
      ],
      environmentVariables: {
        API_URL: 'https://api.example.com',
        API_KEY: 'secret-key',
      },
      queries: [
        {
          windowName: 'Get Users',
          query: '{ users { id name } }',
          id: 'query-1',
          created_at: new Date('2023-01-01T00:00:00Z').getTime(),
          updated_at: new Date('2023-01-02T00:00:00Z').getTime(),
          storageType: 'api',
        },
        {
          windowName: 'Get Posts',
          query: '{ posts { id title } }',
          id: 'query-2',
          created_at: new Date('2023-01-03T00:00:00Z').getTime(),
          updated_at: new Date('2023-01-04T00:00:00Z').getTime(),
          storageType: 'api',
        },
      ],
    });
  });

  it('should handle null/undefined fields', () => {
    const serverCollection: FullQueryCollection = {
      id: 'collection-123',
      name: 'Collection Without Description',
      description: null,
      workspaceId: 'workspace-456',
      queries: [],
      preRequestScript: null,
      preRequestScriptEnabled: true,
      postRequestScript: null,
      postRequestScriptEnabled: true,
      headers: null,
      environmentVariables: null,
      parentCollectionId: null,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    const result = serverCollectionToLocalCollection(serverCollection);

    expect(result).toEqual({
      id: 'collection-123',
      title: 'Collection Without Description',
      description: '',
      workspaceId: 'workspace-456',
      storageType: 'api',
      preRequest: {
        script: '',
        enabled: true,
      },
      postRequest: {
        script: '',
        enabled: true,
      },
      headers: [],
      environmentVariables: {},
      queries: [],
    });
  });
});
