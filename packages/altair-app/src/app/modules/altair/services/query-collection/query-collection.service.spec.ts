import { TestBed, inject } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';
import { IDBFactory } from 'fake-indexeddb';

import { QueryCollectionService } from './query-collection.service';
import { StorageService } from '../storage/storage.service';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { ApiService } from '../api/api.service';
import { AccountService } from '../account/account.service';
import { MockProvider } from 'ng-mocks';

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

  // TODO:
});
