import { TestBed, inject } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - no types for fake-indexeddb in commonjs mode
import { IDBFactory } from 'fake-indexeddb';

import { QueryCollectionService } from './query-collection.service';
import { StorageService } from '../storage/storage.service';
import {
  IQuery,
  IQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { ApiService } from '../api/api.service';
import { AccountService } from '../account/account.service';
import { MockProvider } from 'ng-mocks';

const makeQuery = (overrides: Partial<IQuery> = {}): IQuery => ({
  version: 1,
  type: 'window',
  windowName: 'Test Query',
  apiUrl: 'http://localhost:3000/graphql',
  query: '{ hello }',
  variables: '',
  subscriptionUrl: '',
  subscriptionConnectionParams: undefined,
  requestHandlerId: undefined,
  requestHandlerAdditionalParams: undefined,
  subscriptionUseDefaultRequestHandler: undefined,
  subscriptionRequestHandlerId: undefined,
  preRequestScript: undefined,
  preRequestScriptEnabled: undefined,
  postRequestScript: undefined,
  postRequestScriptEnabled: undefined,
  authorizationType: undefined,
  authorizationData: undefined,
  headers: [],
  ...overrides,
});

const collectionPairs = [
  {
    // parentCollectionId: '',
    collection: {
      id: '1',
      title: 'Collection 1',
      queries: [],
    },
  },
  {
    // parentCollectionId: '',
    collection: {
      id: '2',
      title: 'Collection 2',
      queries: [],
    },
  },
  {
    parentCollectionId: '1',
    collection: {
      id: '3',
      title: 'Collection 3 - in 1',
      queries: [],
    },
  },
  {
    parentCollectionId: '3',
    collection: {
      id: '4',
      title: 'Collection 4 - in 3',
      queries: [],
    },
  },
  {
    parentCollectionId: '2',
    collection: {
      id: '5',
      title: 'Collection 5 - in 2',
      queries: [],
    },
  },
  {
    parentCollectionId: '1',
    collection: {
      id: '6',
      title: 'Collection 6 - in 1',
      queries: [],
    },
  },
  {
    parentCollectionId: '4',
    collection: {
      id: '7',
      title: 'Collection 7 - in 4',
      queries: [],
    },
  },
];

describe('QueryCollectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QueryCollectionService,
        StorageService,
        ApiService,
        MockProvider(AccountService),
      ],
      teardown: { destroyAfterEach: false },
    });
    new IDBFactory();
  });

  it('should be created', inject(
    [QueryCollectionService],
    (service: QueryCollectionService) => {
      expect(service).toBeTruthy();
    }
  ));

  describe('create', () => {
    it('creates and stores a collection', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collection: IQueryCollection = {
          id: '123',
          queries: [],
          title: 'Collection 1',
        };
        const result = await service.createCollection(collection);
        expect(result).toBeTruthy();

        // cleanup
        await service.deleteCollection(result!);
      }
    ));
  });

  describe('getAll', () => {
    it('gets all collections', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        for (let i = 0; i < collectionPairs.length; i++) {
          const pair = collectionPairs[i]!;
          await service.createCollection(
            pair.collection,
            undefined,
            undefined,
            undefined,
            pair.parentCollectionId
          );
        }
        const result = await service.getAll();
        expect(result.length).toBe(7);
      }
    ));
  });

  describe('getCollectionTrees', () => {
    it('returns expected collection trees', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collections = await service.getAll();
        const trees = await service.getCollectionTrees(collections);
        expect(trees).toHaveLength(2);
      }
    ));
    it('returns expected nested collection tree', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collections = [
          {
            id: '1',
            title: 'Collection 1',
            queries: [],
          },
          {
            id: '2',
            title: 'Collection 2',
            queries: [],
            parentPath: '/1',
          },
          {
            id: '3',
            title: 'Collection 3',
            queries: [],
            parentPath: '/1/2',
          },
          {
            id: '4',
            title: 'Collection 4',
            queries: [],
          },
        ];
        const trees = service.getCollectionTrees(collections);
        expect(trees).toHaveLength(2);
        expect(trees[0]).toEqual({
          id: '1',
          title: 'Collection 1',
          queries: [],
          collections: [
            {
              id: '2',
              title: 'Collection 2',
              queries: [],
              parentPath: '/1',
              collections: [
                {
                  id: '3',
                  title: 'Collection 3',
                  queries: [],
                  parentPath: '/1/2',
                  collections: [],
                },
              ],
            },
          ],
        });
      }
    ));
  });

  describe('remapCollectionIDsToCollectionList', () => {
    it('returns expected nested collection tree', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collections = [
          {
            id: '1',
            title: 'Collection 1',
            queries: [],
          },
          {
            id: '2',
            title: 'Collection 2',
            queries: [],
            parentPath: '/1',
          },
          {
            id: '3',
            title: 'Collection 3',
            queries: [],
            parentPath: '/1/2',
          },
        ];
        const trees = service.getCollectionTrees(collections);
        const remapped = service.remapCollectionIDsToCollectionList(trees[0]!);
        const uuidRegex =
          /[a-z0-9]{4,}-[a-z0-9]{4,}-[a-z0-9]{4,}-[a-z0-9]{4,}-[a-z0-9]{4,}/;
        expect(remapped).toEqual([
          {
            id: expect.stringMatching(uuidRegex),
            title: 'Collection 1',
            queries: [],
            parentPath: '',
          },
          {
            id: expect.stringMatching(uuidRegex),
            title: 'Collection 2',
            queries: [],
            parentPath: `/${remapped[0]!.id}`,
          },
          {
            id: expect.stringMatching(uuidRegex),
            title: 'Collection 3',
            queries: [],
            parentPath: `/${remapped[0]!.id}/${remapped[1]!.id}`,
          },
        ]);
      }
    ));
  });

  describe('import/export', () => {
    it('should import nested collection correctly', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const data = {
          id: '1',
          title: 'Collection 1',
          queries: [],
          collections: [
            {
              id: '2',
              title: 'Collection 2',
              queries: [],
              parentPath: '/1',
              collections: [
                {
                  id: '3',
                  title: 'Collection 3',
                  queries: [],
                  parentPath: '/1/2',
                  collections: [],
                },
              ],
            },
          ],
        };

        const exportData = service.getExportCollectionDataFromCollectionTree(data);
        const remapped = service.remapCollectionIDsToCollectionList(exportData);
        const tree = service.getCollectionTrees(remapped);

        expect(tree.length).toEqual(1);
      }
    ));
  });

  describe('addQuery', () => {
    it('adds a query to a collection and returns its id', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collectionId = await service.createCollection({
          title: 'Test Collection',
          queries: [],
        });
        expect(collectionId).toBeTruthy();

        const queryId = await service.addQuery(
          collectionId!,
          makeQuery({ windowName: 'My Query' })
        );
        expect(queryId).toBeTruthy();

        const collection = await service.getCollectionByID(collectionId!);
        expect(collection?.queries).toHaveLength(1);
        expect(collection?.queries[0]?.id).toBe(queryId);
        expect(collection?.queries[0]?.windowName).toBe('My Query');

        await service.deleteCollection(collectionId!);
      }
    ));

    it('returns undefined when collection is not found', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const result = await service.addQuery(
          'non-existent-id',
          makeQuery({ windowName: 'Query' })
        );
        expect(result).toBeUndefined();
      }
    ));
  });

  describe('updateQuery', () => {
    it('updates a query in a collection', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collectionId = await service.createCollection({
          title: 'Update Query Test',
          queries: [],
        });

        const queryId = await service.addQuery(
          collectionId!,
          makeQuery({ windowName: 'Original Name', query: '{ original }' })
        );

        await service.updateQuery(
          collectionId!,
          queryId!,
          makeQuery({
            id: queryId,
            windowName: 'Updated Name',
            query: '{ updated }',
          })
        );

        const collection = await service.getCollectionByID(collectionId!);
        expect(collection?.queries[0]?.windowName).toBe('Updated Name');
        expect(collection?.queries[0]?.query).toBe('{ updated }');

        await service.deleteCollection(collectionId!);
      }
    ));
  });

  describe('deleteQuery', () => {
    it('deletes a query from a collection by id', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collectionId = await service.createCollection({
          title: 'Delete Query Test',
          queries: [],
        });

        const queryId = await service.addQuery(
          collectionId!,
          makeQuery({ windowName: 'To Delete' })
        );

        await service.deleteQuery(
          collectionId!,
          makeQuery({ id: queryId, windowName: 'To Delete' })
        );

        const collection = await service.getCollectionByID(collectionId!);
        expect(collection?.queries).toHaveLength(0);

        await service.deleteCollection(collectionId!);
      }
    ));

    it('deletes a query by windowName when no id', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collectionId = await service.createCollection({
          title: 'Delete By Name Test',
          queries: [makeQuery({ id: 'qid1', windowName: 'MatchName' })],
        });

        await service.deleteQuery(
          collectionId!,
          makeQuery({ id: undefined, windowName: 'MatchName' })
        );

        const collection = await service.getCollectionByID(collectionId!);
        expect(collection?.queries).toHaveLength(0);

        await service.deleteCollection(collectionId!);
      }
    ));
  });

  describe('deleteCollection', () => {
    it('deletes a local collection', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collectionId = await service.createCollection({
          title: 'To Delete',
          queries: [],
        });

        await service.deleteCollection(collectionId!);

        const collection = await service.getCollectionByID(collectionId!);
        expect(collection).toBeUndefined();
      }
    ));

    it('deletes collection and its subcollections', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const parentId = await service.createCollection({
          title: 'Parent',
          queries: [],
        });
        const childId = await service.createCollection(
          { title: 'Child', queries: [] },
          undefined,
          undefined,
          undefined,
          parentId!
        );

        await service.deleteCollection(parentId!);

        const parent = await service.getLocalCollectionByID(parentId!);
        const child = await service.getLocalCollectionByID(childId!);
        expect(parent).toBeUndefined();
        expect(child).toBeUndefined();
      }
    ));
  });

  describe('updateCollection', () => {
    it('updates a local collection', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collectionId = await service.createCollection({
          title: 'Original Title',
          queries: [],
        });

        const collection = await service.getCollectionByID(collectionId!);
        await service.updateCollection(collectionId!, {
          ...collection!,
          title: 'Updated Title',
        });

        const updated = await service.getCollectionByID(collectionId!);
        expect(updated?.title).toBe('Updated Title');

        await service.deleteCollection(collectionId!);
      }
    ));
  });

  describe('getExportCollectionData', () => {
    it('returns export data for a collection', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collectionId = await service.createCollection({
          title: 'Export Test',
          queries: [],
        });

        const exportData = await service.getExportCollectionData(collectionId!);
        expect(exportData.version).toBe(1);
        expect(exportData.type).toBe('collection');
        expect(exportData.title).toBe('Export Test');

        await service.deleteCollection(collectionId!);
      }
    ));

    it('throws when collection not found', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        await expect(service.getExportCollectionData('nonexistent')).rejects.toThrow(
          'Collection not found!'
        );
      }
    ));
  });

  describe('importCollectionDataFromJson', () => {
    it('throws on empty string', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        await expect(service.importCollectionDataFromJson('')).rejects.toThrow(
          'String is empty.'
        );
      }
    ));

    it('throws on invalid JSON', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        await expect(
          service.importCollectionDataFromJson('not-valid-json')
        ).rejects.toThrow();
      }
    ));

    it('imports valid collection JSON', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const data = JSON.stringify({
          version: 1,
          type: 'collection',
          id: 'import-1',
          title: 'Imported Collection',
          queries: [],
          collections: [],
        });
        await service.importCollectionDataFromJson(data);
        const all = await service.getAll(false);
        const imported = all.find((c) => c.title === 'Imported Collection');
        expect(imported).toBeTruthy();
        if (imported?.id) {
          await service.deleteCollection(imported.id);
        }
      }
    ));
  });

  describe('importCollectionData', () => {
    it('throws when data is missing type or version', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        await expect(
          service.importCollectionData({
            version: 1,
            type: 'wrong' as any,
            id: '1',
            title: 'X',
            queries: [],
          })
        ).rejects.toThrow('File is not a valid Altair collection file.');
      }
    ));
  });

  describe('getSubcollections', () => {
    it('returns direct subcollections', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const parentId = await service.createCollection({
          title: 'Parent',
          queries: [],
        });
        await service.createCollection(
          { title: 'Child 1', queries: [] },
          undefined,
          undefined,
          undefined,
          parentId!
        );
        await service.createCollection(
          { title: 'Child 2', queries: [] },
          undefined,
          undefined,
          undefined,
          parentId!
        );

        const subs = await service.getSubcollections(parentId!);
        expect(subs).toHaveLength(2);

        await service.deleteCollection(parentId!);
      }
    ));

    it('returns all descendants recursively', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const parentId = await service.createCollection({
          title: 'Root',
          queries: [],
        });
        const childId = await service.createCollection(
          { title: 'Child', queries: [] },
          undefined,
          undefined,
          undefined,
          parentId!
        );
        await service.createCollection(
          { title: 'Grandchild', queries: [] },
          undefined,
          undefined,
          undefined,
          childId!
        );

        const allSubs = await service.getSubcollections(parentId!, true);
        expect(allSubs).toHaveLength(2);

        await service.deleteCollection(parentId!);
      }
    ));
  });

  describe('getCollectionListFromTree', () => {
    it('returns flat collection list from tree', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const tree = {
          id: 'root',
          title: 'Root',
          queries: [],
          collections: [
            {
              id: 'child1',
              title: 'Child 1',
              queries: [],
              collections: [],
            },
          ],
        };
        const list = service.getCollectionListFromTree(tree);
        expect(list).toHaveLength(2);
        expect(list[0]?.id).toBe('root');
        expect(list[1]?.id).toBe('child1');
        expect(list[1]?.parentPath).toBe('/root');
      }
    ));
  });

  describe('getParentCollectionId', () => {
    it('returns parent collection id from parentPath', inject(
      [QueryCollectionService],
      (service: QueryCollectionService) => {
        const collection = {
          id: 'child',
          title: 'Child',
          queries: [],
          parentPath: '/parent-id',
        };
        expect(service.getParentCollectionId(collection)).toBe('parent-id');
      }
    ));

    it('returns undefined when no parentPath', inject(
      [QueryCollectionService],
      (service: QueryCollectionService) => {
        const collection = { id: 'root', title: 'Root', queries: [] };
        expect(service.getParentCollectionId(collection)).toBeUndefined();
      }
    ));

    it('returns last segment of parentPath', inject(
      [QueryCollectionService],
      (service: QueryCollectionService) => {
        const collection = {
          id: 'deep',
          title: 'Deep',
          queries: [],
          parentPath: '/grandparent/parent',
        };
        expect(service.getParentCollectionId(collection)).toBe('parent');
      }
    ));
  });

  describe('getParentCollection', () => {
    it('returns the parent collection', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const parentId = await service.createCollection({
          title: 'Parent Col',
          queries: [],
        });
        const childId = await service.createCollection(
          { title: 'Child Col', queries: [] },
          undefined,
          undefined,
          undefined,
          parentId!
        );

        const child = await service.getCollectionByID(childId!);
        const parent = await service.getParentCollection(child!);
        expect(parent?.title).toBe('Parent Col');

        await service.deleteCollection(parentId!);
      }
    ));

    it('returns undefined when no parentPath', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collectionId = await service.createCollection({
          title: 'Root Col',
          queries: [],
        });
        const collection = await service.getCollectionByID(collectionId!);
        const parent = await service.getParentCollection(collection!);
        expect(parent).toBeUndefined();
        await service.deleteCollection(collectionId!);
      }
    ));
  });

  describe('getAllParentCollections', () => {
    it('returns all ancestor collections', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const grandparentId = await service.createCollection({
          title: 'Grandparent',
          queries: [],
        });
        const parentId = await service.createCollection(
          { title: 'Parent', queries: [] },
          undefined,
          undefined,
          undefined,
          grandparentId!
        );
        const childId = await service.createCollection(
          { title: 'Child', queries: [] },
          undefined,
          undefined,
          undefined,
          parentId!
        );

        const child = await service.getCollectionByID(childId!);
        const ancestors = await service.getAllParentCollections(child!);
        expect(ancestors).toHaveLength(2);
        expect(ancestors[0]?.title).toBe('Parent');
        expect(ancestors[1]?.title).toBe('Grandparent');

        await service.deleteCollection(grandparentId!);
      }
    ));
  });

  describe('getCollectionByID', () => {
    it('retrieves a collection by its id', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const collectionId = await service.createCollection({
          title: 'Find Me',
          queries: [],
        });

        const found = await service.getCollectionByID(collectionId!);
        expect(found?.title).toBe('Find Me');

        await service.deleteCollection(collectionId!);
      }
    ));

    it('returns undefined for non-existent id', inject(
      [QueryCollectionService],
      async (service: QueryCollectionService) => {
        const found = await service.getLocalCollectionByID('does-not-exist');
        expect(found).toBeUndefined();
      }
    ));
  });
});
