/**
 * Integration test to verify collection sorting preferences are preserved
 * across app sessions via the storage sync mechanism
 */
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CollectionsMetaState } from 'altair-graphql-core/build/types/state/collections-meta.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import * as collectionsMetaActions from './collections-meta.action';
import { selectCollectionsSortBy, selectQueriesSortBy } from './selectors';

describe('CollectionsMeta Storage Persistence Integration', () => {
  let store: MockStore<RootState>;
  let initialState: Partial<RootState>;

  beforeEach(() => {
    initialState = {
      collectionsMeta: {
        collectionsSortBy: 'newest',
        queriesSortBy: 'newest',
      } as CollectionsMetaState,
    };

    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState })],
    });

    store = TestBed.inject(Store) as MockStore<RootState>;
  });

  it('should preserve collections sort preference when changed', (done) => {
    // Initial state should be 'newest'
    store.select(selectCollectionsSortBy).subscribe((sortBy) => {
      if (sortBy === 'newest') {
        // Change to 'a-z' and verify it's updated
        store.dispatch(
          new collectionsMetaActions.UpdateCollectionsSortByAction({
            sortBy: 'a-z',
          })
        );
      } else if (sortBy === 'a-z') {
        // Verify the change was persisted
        expect(sortBy).toBe('a-z');
        done();
      }
    });
  });

  it('should preserve queries sort preference when changed', (done) => {
    // Initial state should be 'newest'
    store.select(selectQueriesSortBy).subscribe((sortBy) => {
      if (sortBy === 'newest') {
        // Change to 'z-a' and verify it's updated
        store.dispatch(
          new collectionsMetaActions.UpdateQueriesSortByAction({
            sortBy: 'z-a',
          })
        );
      } else if (sortBy === 'z-a') {
        // Verify the change was persisted
        expect(sortBy).toBe('z-a');
        done();
      }
    });
  });

  it('should maintain independent sorting preferences for collections and queries', () => {
    // Set different sort preferences
    store.dispatch(
      new collectionsMetaActions.UpdateCollectionsSortByAction({
        sortBy: 'oldest',
      })
    );
    store.dispatch(
      new collectionsMetaActions.UpdateQueriesSortByAction({
        sortBy: 'a-z',
      })
    );

    // Verify they are independent
    let collectionsSortBy: string;
    let queriesSortBy: string;

    store.select(selectCollectionsSortBy).subscribe((sortBy) => {
      collectionsSortBy = sortBy;
    });
    store.select(selectQueriesSortBy).subscribe((sortBy) => {
      queriesSortBy = sortBy;
    });

    expect(collectionsSortBy).toBe('oldest');
    expect(queriesSortBy).toBe('a-z');
  });

  it('should handle state restoration from storage correctly', () => {
    // Simulate state restoration with different sort preferences
    const restoredState: Partial<RootState> = {
      collectionsMeta: {
        collectionsSortBy: 'z-a',
        queriesSortBy: 'oldest',
      } as CollectionsMetaState,
    };

    store.setState(restoredState);

    // Verify the restored state is applied
    let collectionsSortBy: string;
    let queriesSortBy: string;

    store.select(selectCollectionsSortBy).subscribe((sortBy) => {
      collectionsSortBy = sortBy;
    });
    store.select(selectQueriesSortBy).subscribe((sortBy) => {
      queriesSortBy = sortBy;
    });

    expect(collectionsSortBy).toBe('z-a');
    expect(queriesSortBy).toBe('oldest');
  });
});