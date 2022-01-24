import { TestBed, inject } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';

import { QueryCollectionService } from './query-collection.service';
import { StorageService } from '../storage/storage.service';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';

const collectionPairs = [
  {
    // parentCollectionId: '',
    collection: {
      id: 1,
      title: 'Collection 1',
      queries: [],
    },
  },
  {
    // parentCollectionId: '',
    collection: {
      id: 2,
      title: 'Collection 2',
      queries: [],
    },
  },
  {
    parentCollectionId: 1,
    collection: {
      id: 3,
      title: 'Collection 3 - in 1',
      queries: [],
    },
  },
  {
    parentCollectionId: 3,
    collection: {
      id: 4,
      title: 'Collection 4 - in 3',
      queries: [],
    },
  },
  {
    parentCollectionId: 2,
    collection: {
      id: 5,
      title: 'Collection 5 - in 2',
      queries: [],
    },
  },
  {
    parentCollectionId: 1,
    collection: {
      id: 6,
      title: 'Collection 6 - in 1',
      queries: [],
    },
  },
  {
    parentCollectionId: 4,
    collection: {
      id: 7,
      title: 'Collection 7 - in 4',
      queries: [],
    },
  },
];

describe('QueryCollectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QueryCollectionService, StorageService]
    });
  });

  it('should be created', inject([QueryCollectionService], (service: QueryCollectionService) => {
    expect(service).toBeTruthy();
  }));

  describe('create', () => {
    it('creates and stores a collection', inject([QueryCollectionService], async (service: QueryCollectionService) => {
      const collection: IQueryCollection = {
        queries: [],
        title: 'Collection 1',
      };
      const result = await service.create(collection);
      expect(result).toBeTruthy();

      // cleanup
      await service.deleteCollection(result);
    }));
  });

  describe('getAll', () => {
    it('gets all collections', inject([QueryCollectionService], async (service: QueryCollectionService) => {
      for (let i = 0; i < collectionPairs.length; i++) {
        const pair = collectionPairs[i];
        await service.create(pair.collection, pair.parentCollectionId);
      }
      const result = await service.getAll();
      expect(result.length).toBe(7);
    }));
  });

  describe('getCollectionTrees', () => {
    it('returns expected collection trees', inject([QueryCollectionService], async (service: QueryCollectionService) => {
      const collections = await service.getAll();
      const trees = await service.getCollectionTrees(collections);
      expect(trees).toHaveLength(2);
    }));
  });



  // TODO:
});
