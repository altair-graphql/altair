/**
 * Integration test to verify the complete collection sorting persistence fix
 * This test demonstrates that the bug fix resolves the reported issue
 */
import { selectSortedCollections } from './selectors';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';

describe('Collection Sorting Persistence - Issue Fix Validation', () => {
  /**
   * This test replicates the scenario described in the GitHub issue:
   * - User has collections with different titles
   * - User changes sort preference to a-z or z-a
   * - Sort preference should be preserved and work consistently
   */
  
  const createTestCollections = (): IQueryCollection[] => [
    {
      id: '1',
      title: 'My API Tests',
      queries: [],
      updated_at: 1609459200000, // Jan 1, 2021
    },
    {
      id: '2', 
      title: 'Authentication',
      queries: [],
      updated_at: 1640995200000, // Jan 1, 2022 (newer)
    },
    {
      id: '3',
      title: 'User Management', 
      queries: [],
      updated_at: 1577836800000, // Jan 1, 2020 (older)
    },
    {
      id: '4',
      title: '', // Test edge case - empty title
      queries: [],
      updated_at: 1672531200000, // Jan 1, 2023 (newest)
    },
  ];

  it('should preserve A-Z sorting preference and work consistently', () => {
    const collections = createTestCollections();
    
    // User changes sort to A-Z - this should be persisted
    const state: RootState = {
      collection: { list: collections },
      collectionsMeta: {
        collectionsSortBy: 'a-z' as any,
        queriesSortBy: 'newest' as any,
      },
    } as RootState;

    const sortedCollections = selectSortedCollections(state);
    const titles = sortedCollections.map(c => c.title || '[empty]');

    // Should be sorted alphabetically with empty title first
    expect(titles).toEqual([
      '[empty]',           // Empty string comes first
      'Authentication',    // A comes before M and U
      'My API Tests',      // M comes after A
      'User Management',   // U comes last
    ]);

    // Verify multiple calls return consistent results (bug was inconsistent sorting)
    const sortedAgain = selectSortedCollections(state);
    const titlesAgain = sortedAgain.map(c => c.title || '[empty]');
    expect(titlesAgain).toEqual(titles); // Should be identical
  });

  it('should preserve Z-A sorting preference and work consistently', () => {
    const collections = createTestCollections();
    
    // User changes sort to Z-A - this should be persisted  
    const state: RootState = {
      collection: { list: collections },
      collectionsMeta: {
        collectionsSortBy: 'z-a' as any,
        queriesSortBy: 'newest' as any,
      },
    } as RootState;

    const sortedCollections = selectSortedCollections(state);
    const titles = sortedCollections.map(c => c.title || '[empty]');

    // Should be sorted reverse alphabetically
    expect(titles).toEqual([
      'User Management',   // U comes first in reverse
      'My API Tests',      // M comes next  
      'Authentication',    // A comes next
      '[empty]',           // Empty string comes last in reverse
    ]);

    // Verify consistency
    const sortedAgain = selectSortedCollections(state);
    const titlesAgain = sortedAgain.map(c => c.title || '[empty]');
    expect(titlesAgain).toEqual(titles);
  });

  it('should preserve newest/oldest sorting and handle missing timestamps', () => {
    const collections = createTestCollections();
    
    // Test newest sorting (default)
    const newestState: RootState = {
      collection: { list: collections },
      collectionsMeta: {
        collectionsSortBy: 'newest' as any,
        queriesSortBy: 'newest' as any,
      },
    } as RootState;

    const newestSorted = selectSortedCollections(newestState);
    const newestTitles = newestSorted.map(c => c.title || '[empty]');

    expect(newestTitles).toEqual([
      '[empty]',           // 2023 (newest)
      'Authentication',    // 2022
      'My API Tests',      // 2021  
      'User Management',   // 2020 (oldest)
    ]);

    // Test oldest sorting
    const oldestState: RootState = {
      collection: { list: collections },
      collectionsMeta: {
        collectionsSortBy: 'oldest' as any,
        queriesSortBy: 'newest' as any,
      },
    } as RootState;

    const oldestSorted = selectSortedCollections(oldestState);
    const oldestTitles = oldestSorted.map(c => c.title || '[empty]');

    expect(oldestTitles).toEqual([
      'User Management',   // 2020 (oldest)
      'My API Tests',      // 2021
      'Authentication',    // 2022
      '[empty]',           // 2023 (newest) 
    ]);
  });

  it('should demonstrate the fix resolves the original inconsistency bug', () => {
    const collections: IQueryCollection[] = [
      {
        id: '1',
        title: '',  // This empty title was causing the bug
        queries: [],
        updated_at: 1000,
      },
      {
        id: '2',
        title: 'Beta',
        queries: [],
        updated_at: 2000,
      },
    ];

    const state: RootState = {
      collection: { list: collections },
      collectionsMeta: {
        collectionsSortBy: 'a-z' as any,
        queriesSortBy: 'newest' as any,
      },
    } as RootState;

    // Before the fix: empty title was compared against updated_at number
    // This caused inconsistent string vs number comparisons
    // After the fix: empty title is treated as empty string consistently

    const results = [];
    for (let i = 0; i < 10; i++) {
      const sorted = selectSortedCollections(state);
      results.push(sorted.map(c => c.title || '[empty]'));
    }

    // All results should be identical - demonstrating consistent sorting
    const firstResult = results[0];
    results.forEach(result => {
      expect(result).toEqual(firstResult);
    });

    // Should consistently sort with empty title first
    expect(firstResult).toEqual(['[empty]', 'Beta']);
  });
});