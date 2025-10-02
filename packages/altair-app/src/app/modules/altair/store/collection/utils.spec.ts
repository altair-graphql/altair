import {
  getCollections,
  getCollection,
  getParentCollectionId,
  getParentCollection,
  getAllParentCollections,
  getWindowParentCollections,
} from './utils';
import {
  CollectionState,
  IQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';

describe('Collection Utils', () => {
  describe('getCollections', () => {
    it('should return the list of collections from state', () => {
      const mockCollections: IQueryCollection[] = [
        {
          id: 'col-1',
          title: 'Collection 1',
          queries: [],
        },
        {
          id: 'col-2',
          title: 'Collection 2',
          queries: [],
        },
      ];

      const state: CollectionState = {
        list: mockCollections,
      };

      const result = getCollections(state);

      expect(result).toEqual(mockCollections);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when list is undefined', () => {
      const state: CollectionState = {
        list: undefined as any,
      };

      const result = getCollections(state);

      expect(result).toEqual([]);
    });
  });

  describe('getCollection', () => {
    it('should find and return collection by id', () => {
      const collections: IQueryCollection[] = [
        {
          id: 'col-1',
          title: 'Collection 1',
          queries: [],
        },
        {
          id: 'col-2',
          title: 'Collection 2',
          queries: [],
        },
        {
          id: 'col-3',
          title: 'Collection 3',
          queries: [],
        },
      ];

      const result = getCollection(collections, 'col-2');

      expect(result).toEqual({
        id: 'col-2',
        title: 'Collection 2',
        queries: [],
      });
    });

    it('should return undefined when collection is not found', () => {
      const collections: IQueryCollection[] = [
        {
          id: 'col-1',
          title: 'Collection 1',
          queries: [],
        },
      ];

      const result = getCollection(collections, 'non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('getParentCollectionId', () => {
    it('should return parent collection id from parentPath', () => {
      const collection: IQueryCollection = {
        id: 'child-col',
        title: 'Child Collection',
        queries: [],
        parentPath: '/parent-col',
      };

      const result = getParentCollectionId(collection);

      expect(result).toBe('parent-col');
    });

    it('should return last segment from nested parentPath', () => {
      const collection: IQueryCollection = {
        id: 'child-col',
        title: 'Child Collection',
        queries: [],
        parentPath: '/root/level1/level2/grandparent-col/parent-col',
      };

      const result = getParentCollectionId(collection);

      expect(result).toBe('parent-col');
    });

    it('should return undefined when parentPath is undefined', () => {
      const collection: IQueryCollection = {
        id: 'root-col',
        title: 'Root Collection',
        queries: [],
      };

      const result = getParentCollectionId(collection);

      expect(result).toBeUndefined();
    });
  });

  describe('getParentCollection', () => {
    const mockCollections: IQueryCollection[] = [
      {
        id: 'root-col',
        title: 'Root Collection',
        queries: [],
      },
      {
        id: 'parent-col',
        title: 'Parent Collection',
        queries: [],
        parentPath: '/root-col',
      },
      {
        id: 'child-col',
        title: 'Child Collection',
        queries: [],
        parentPath: '/root-col/parent-col',
      },
    ];

    it('should return parent collection when parentPath exists', () => {
      const childCollection = mockCollections[2]!;

      const result = getParentCollection(mockCollections, childCollection);

      expect(result).toEqual({
        id: 'parent-col',
        title: 'Parent Collection',
        queries: [],
        parentPath: '/root-col',
      });
    });

    it('should return undefined when collection has no parentPath', () => {
      const rootCollection = mockCollections[0]!;

      const result = getParentCollection(mockCollections, rootCollection);

      expect(result).toBeUndefined();
    });

    it('should return undefined when parent collection does not exist', () => {
      const orphanCollection: IQueryCollection = {
        id: 'orphan-col',
        title: 'Orphan Collection',
        queries: [],
        parentPath: '/non-existent-parent',
      };

      const result = getParentCollection(mockCollections, orphanCollection);

      expect(result).toBeUndefined();
    });
  });

  describe('getAllParentCollections', () => {
    const mockCollections: IQueryCollection[] = [
      {
        id: 'root-col',
        title: 'Root Collection',
        queries: [],
      },
      {
        id: 'level1-col',
        title: 'Level 1 Collection',
        queries: [],
        parentPath: '/root-col',
      },
      {
        id: 'level2-col',
        title: 'Level 2 Collection',
        queries: [],
        parentPath: '/root-col/level1-col',
      },
      {
        id: 'level3-col',
        title: 'Level 3 Collection',
        queries: [],
        parentPath: '/root-col/level1-col/level2-col',
      },
    ];

    it('should return all parent collections in order, with the direct parent last', () => {
      const deepestCollection = mockCollections[3]!;

      const result = getAllParentCollections(mockCollections, deepestCollection);

      expect(result).toHaveLength(3);
      expect(result[0]!.id).toBe('root-col');
      expect(result[1]!.id).toBe('level1-col');
      expect(result[2]!.id).toBe('level2-col');
    });

    it('should return single parent for direct child', () => {
      const level1Collection = mockCollections[1]!;

      const result = getAllParentCollections(mockCollections, level1Collection);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('root-col');
    });

    it('should return empty array for root collection', () => {
      const rootCollection = mockCollections[0]!;

      const result = getAllParentCollections(mockCollections, rootCollection);

      expect(result).toEqual([]);
    });

    it('should return empty array when collection has no parent', () => {
      const standaloneCollection: IQueryCollection = {
        id: 'standalone-col',
        title: 'Standalone Collection',
        queries: [],
      };

      const result = getAllParentCollections(mockCollections, standaloneCollection);

      expect(result).toEqual([]);
    });
  });

  describe('getWindowParentCollections', () => {
    const mockCollections: IQueryCollection[] = [
      {
        id: 'root-col',
        title: 'Root Collection',
        queries: [],
      },
      {
        id: 'parent-col',
        title: 'Parent Collection',
        queries: [],
        parentPath: '/root-col',
      },
      {
        id: 'child-col',
        title: 'Child Collection',
        queries: [],
        parentPath: '/root-col/parent-col',
      },
    ];

    it('should return collection and all parents when window is in collection', () => {
      const window = {
        layout: {
          windowIdInCollection: 'query-1',
          collectionId: 'child-col',
        },
      } as PerWindowState;

      const result = getWindowParentCollections(window, mockCollections);

      expect(result).toHaveLength(3);
      expect(result[0]!.id).toBe('root-col');
      expect(result[1]!.id).toBe('parent-col');
      expect(result[2]!.id).toBe('child-col');
    });

    it('should return single collection when it has no parents', () => {
      const window = {
        layout: {
          windowIdInCollection: 'query-1',
          collectionId: 'root-col',
        },
      } as PerWindowState;

      const result = getWindowParentCollections(window, mockCollections);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('root-col');
    });

    it('should return empty array when window has no windowIdInCollection', () => {
      const window = {
        layout: {
          collectionId: 'child-col',
        },
      } as PerWindowState;

      const result = getWindowParentCollections(window, mockCollections);

      expect(result).toEqual([]);
    });

    it('should return empty array when window has no collectionId', () => {
      const window = {
        layout: {
          windowIdInCollection: 'query-1',
        },
      } as PerWindowState;

      const result = getWindowParentCollections(window, mockCollections);

      expect(result).toEqual([]);
    });

    it('should return empty array when collection does not exist', () => {
      const window = {
        layout: {
          windowIdInCollection: 'query-1',
          collectionId: 'non-existent-col',
        },
      } as PerWindowState;

      const result = getWindowParentCollections(window, mockCollections);

      expect(result).toEqual([]);
    });
  });
});
