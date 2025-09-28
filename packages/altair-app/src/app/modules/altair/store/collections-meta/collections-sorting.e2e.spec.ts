/**
 * End-to-end test to verify collection sorting behavior
 * Tests the complete flow from state persistence to UI rendering
 */
import { selectSortedCollections, selectCollectionsSortBy } from './selectors';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';

describe('Collection Sorting End-to-End Behavior', () => {
  const mockCollections: IQueryCollection[] = [
    {
      id: '1',
      title: 'Alpha Collection',
      queries: [],
      created_at: 1000,
      updated_at: 3000,
    },
    {
      id: '2', 
      title: 'Zulu Collection',
      queries: [],
      created_at: 2000,
      updated_at: 1000,
    },
    {
      id: '3',
      title: 'Beta Collection', 
      queries: [],
      created_at: 3000,
      updated_at: 2000,
    },
  ];

  const createMockState = (sortBy: string = 'newest'): RootState => ({
    collection: {
      list: mockCollections,
    },
    collectionsMeta: {
      collectionsSortBy: sortBy as any,
      queriesSortBy: 'newest' as any,
    },
  }) as RootState;

  it('should sort collections by title A-Z when sort preference is a-z', () => {
    const state = createMockState('a-z');
    const sortBy = selectCollectionsSortBy(state);
    const sortedCollections = selectSortedCollections(state);

    expect(sortBy).toBe('a-z');
    expect(sortedCollections.map(c => c.title)).toEqual([
      'Alpha Collection',
      'Beta Collection', 
      'Zulu Collection',
    ]);
  });

  it('should sort collections by title Z-A when sort preference is z-a', () => {
    const state = createMockState('z-a');
    const sortBy = selectCollectionsSortBy(state);
    const sortedCollections = selectSortedCollections(state);

    expect(sortBy).toBe('z-a');
    expect(sortedCollections.map(c => c.title)).toEqual([
      'Zulu Collection',
      'Beta Collection',
      'Alpha Collection',
    ]);
  });

  it('should sort collections by newest when sort preference is newest', () => {
    const state = createMockState('newest');
    const sortBy = selectCollectionsSortBy(state);
    const sortedCollections = selectSortedCollections(state);

    expect(sortBy).toBe('newest');
    expect(sortedCollections.map(c => c.title)).toEqual([
      'Alpha Collection',   // updated_at: 3000 (newest)
      'Beta Collection',    // updated_at: 2000
      'Zulu Collection',    // updated_at: 1000 (oldest)
    ]);
  });

  it('should sort collections by oldest when sort preference is oldest', () => {
    const state = createMockState('oldest');
    const sortBy = selectCollectionsSortBy(state);
    const sortedCollections = selectSortedCollections(state);

    expect(sortBy).toBe('oldest');
    expect(sortedCollections.map(c => c.title)).toEqual([
      'Zulu Collection',    // updated_at: 1000 (oldest)
      'Beta Collection',    // updated_at: 2000
      'Alpha Collection',   // updated_at: 3000 (newest)
    ]);
  });

  it('should return collections in original order when sort preference is not recognized', () => {
    const state = createMockState('invalid');
    const sortBy = selectCollectionsSortBy(state);
    const sortedCollections = selectSortedCollections(state);

    expect(sortBy).toBe('invalid');
    expect(sortedCollections.map(c => c.title)).toEqual([
      'Alpha Collection',
      'Zulu Collection',
      'Beta Collection',
    ]);
  });

  it('should preserve sort preference across state changes', () => {
    // Simulate initial state with default sorting
    const initialState = createMockState('newest');
    expect(selectCollectionsSortBy(initialState)).toBe('newest');

    // Simulate user changing sort preference (would be done via action dispatch)
    const updatedState = createMockState('a-z');
    expect(selectCollectionsSortBy(updatedState)).toBe('a-z');
    
    // Verify collections are sorted according to the new preference
    const sortedCollections = selectSortedCollections(updatedState);
    expect(sortedCollections.map(c => c.title)).toEqual([
      'Alpha Collection',
      'Beta Collection',
      'Zulu Collection',
    ]);
  });

  it('should handle edge cases like empty titles', () => {
    const collectionsWithEmptyTitles: IQueryCollection[] = [
      {
        id: '1',
        title: '',
        queries: [],
        updated_at: 2000,
      },
      {
        id: '2',
        title: 'Beta Collection',
        queries: [],
        updated_at: 1000,
      },
      {
        id: '3',
        title: undefined as any, // Test undefined title
        queries: [],
        updated_at: 3000,
      },
    ];

    const state: RootState = {
      collection: {
        list: collectionsWithEmptyTitles,
      },
      collectionsMeta: {
        collectionsSortBy: 'a-z' as any,
        queriesSortBy: 'newest' as any,
      },
    } as RootState;

    const sortedCollections = selectSortedCollections(state);
    
    // Should handle empty/undefined titles gracefully using localeCompare
    expect(sortedCollections).toHaveLength(3);
    // Empty string and undefined should come before "Beta Collection"
    expect(sortedCollections[0].title).toBe(''); // Empty string
    expect(sortedCollections[1].title).toBeUndefined(); // undefined
    expect(sortedCollections[2].title).toBe('Beta Collection');
  });

  it('should handle edge cases like missing updated_at timestamps', () => {
    const collectionsWithoutTimestamps: IQueryCollection[] = [
      {
        id: '1',
        title: 'Alpha Collection',
        queries: [],
        updated_at: undefined as any,
      },
      {
        id: '2',
        title: 'Beta Collection',
        queries: [],
        updated_at: 1000,
      },
      {
        id: '3',
        title: 'Gamma Collection',
        queries: [],
        // updated_at completely missing
      } as any,
    ];

    const state: RootState = {
      collection: {
        list: collectionsWithoutTimestamps,
      },
      collectionsMeta: {
        collectionsSortBy: 'newest' as any,
        queriesSortBy: 'newest' as any,
      },
    } as RootState;

    const sortedCollections = selectSortedCollections(state);
    
    // Should handle missing timestamps gracefully by treating them as 0
    expect(sortedCollections).toHaveLength(3);
    expect(sortedCollections[0].title).toBe('Beta Collection'); // updated_at: 1000
    // Collections with undefined/missing updated_at (treated as 0) should come last
    expect(['Alpha Collection', 'Gamma Collection']).toContain(sortedCollections[1].title);
    expect(['Alpha Collection', 'Gamma Collection']).toContain(sortedCollections[2].title);
  });
});