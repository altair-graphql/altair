
import {from as observableFrom, Observable, empty as observableEmpty, throwError, of } from 'rxjs';
import { Injectable } from '@angular/core';
import uuid from 'uuid/v4';
import { ExportCollectionState, IQuery, IQueryCollection, IQueryCollectionTree } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { StorageService } from '../storage/storage.service';
import { debug } from '../../utils/logger';
import { getFileStr } from '../../utils';

type CollectionID = number;
type QueryID = string;
const COLLECTION_PATH_SEPARATOR = '/';

// Handling hierarchical data
// https://stackoverflow.com/questions/4048151/what-are-the-options-for-storing-hierarchical-data-in-a-relational-database
// https://github.com/dexie/Dexie.js/issues/749
@Injectable()
export class QueryCollectionService {

  constructor(
    private storage: StorageService
  ) { }

  create(collection: IQueryCollection, parentCollectionId?: CollectionID) {
    const resultPromise = (async () => {
      const now = this.storage.now();
      let parentPath = '';
      if (parentCollectionId) {
        parentPath = await this.getSubcollectionParentPath(parentCollectionId);
      }
  
      collection.queries = collection.queries.map((query) => {
        return { ...query, id: uuid(), created_at: now, updated_at: now }
      });
      return this.storage.queryCollections.add({
        ...collection,
        parentPath,
        created_at: now,
        updated_at: now,
      });
    })();

    return observableFrom(resultPromise);
  }

  addQuery(collectionId: CollectionID, query: IQuery): Observable<any> {
    const now = this.storage.now();
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
        const uQuery = { ...query, id: uuid(), created_at: now, updated_at: now };
        collection.queries.push(uQuery);
        collection.updated_at = now;
      })
    );
  }

  updateQuery(collectionId: CollectionID, queryId: QueryID, query: IQuery): Observable<any> {
    const now = this.storage.now();
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
        const uQuery = { ...query, id: queryId, updated_at: now };
        collection.queries = collection.queries.map(collectionQuery => {
          if (collectionQuery.id === queryId) {
            collectionQuery = uQuery;
          }
          return collectionQuery;
        });
        collection.updated_at = now;
      })
    );
  }

  deleteQuery(collectionId: CollectionID, query: IQuery): Observable<any> {
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
        collection.queries = collection.queries.filter(collectionQuery => {
          if (query.id) {
            if (query.id === collectionQuery.id) {
              return false;
            }
          } else {
            // Added for backward compatibility. Initially queries didn't have ids. Remove after a while.
            if (query.windowName === collectionQuery.windowName) {
              return false;
            }
          }

          return true;
        });

        collection.updated_at = this.storage.now();
      })
    );
  }

  deleteCollection(collectionId: CollectionID) {
    return observableFrom(this.storage.queryCollections.delete(collectionId));
  }

  updateCollection(collectionId: CollectionID, modifiedCollection: IQueryCollection) {
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify((collection, ctx) => {
        ctx.value = modifiedCollection;
        ctx.value.updated_at = this.storage.now();
      })
    );
  }

  getExportCollectionData(collectionId: CollectionID) {
    return observableFrom(
      this.getCollectionTreeByCollectionId(collectionId).then((collectionTree) => {
        const exportCollectionData: ExportCollectionState = {
          version: 1,
          type: 'collection',
          ...collectionTree,
        };

        return exportCollectionData;
      })
    );
  }

  importCollectionDataFromJson(data: string) {
    if (!data) {
      return throwError(new Error('String is empty.'));
    }

    try {
      return this.importCollectionData(JSON.parse(data));
    } catch (err) {
      debug.log('The file is invalid.', err);
      return throwError(err);
    }
  }

  async importCollectionData(data: ExportCollectionState) {
    try {
      // Verify file's content
      if (!data) {
        throw new Error('Object is empty.');
      }
      if (!data.version || !data.type || data.type !== 'collection') {
        throw new Error('File is not a valid Altair collection file.');
      }

      const collections = this.getCollectionListFromTree(data);
      for (let i = 0; i < collections.length; i++) {
        const collection = collections[i];
        await this.create(collection).toPromise();
      }

    } catch (err) {
      debug.log('Something went wrong while importing the data.', err);
      throw err;
    }
  }

  importCollectionData$(data: ExportCollectionState) {
    return observableFrom(this.importCollectionData(data));
  }

  handleImportedFile(files: FileList) {
    return getFileStr(files).then((dataStr: string) => {
      try {
        this.importCollectionDataFromJson(dataStr);
      } catch (error) {
        debug.log('There was an issue importing the file.', error);
      }
    });
  }

  getAll() {
    return observableFrom(this.storage.queryCollections.toArray());
  }

  /**
   * 
   * @param collectionId the parent collection ID 
   * @param recursive determines if all the descendants (sub collections of sub collections) should be retrieved
   */
  async getSubcollections(collectionId: CollectionID, recursive = false): Promise<IQueryCollection[]> {
    const parentPath = await this.getSubcollectionParentPath(collectionId);
    const whereClause = this.storage.queryCollections.where('parentPath');

    if (recursive) {
      return whereClause.startsWith(parentPath).toArray();
    }
    return whereClause.equals(parentPath).toArray();
  }

  getSubcollections$(collectionId: CollectionID, recursive = false) {
    observableFrom(this.getSubcollections(collectionId, recursive));
  }

  /**
   * Moves a collection from its previous parent in the tree to a new parent collection
   * @param collectionId
   * @param newParentCollectionId
   */
  moveCollection(collectionId: CollectionID, newParentCollectionId: CollectionID) {
    const resultPromise = this.storage.transaction('rw', this.storage.queryCollections, async () => {
      const collection = await this.storage.queryCollections.get(collectionId);
      if (!collection) {
        throw new Error('Could not retrieve collection');
      }

      // '/coll-z', id: 456
      const newParentCollection = await this.storage.queryCollections.get(newParentCollectionId);
      if (!newParentCollection) {
        throw new Error('Could not retrieve parent collection');
      }
      const newParentCollectionParentPath = newParentCollection.parentPath ?? '';
      const newParentSubcollectionParentPath = `${newParentCollectionParentPath}${COLLECTION_PATH_SEPARATOR}${newParentCollectionId}`;

      // '/coll-a'
      const collectionParentPath = collection.parentPath ?? '';
      // '/coll-a/123'
      const parentPath = `${collectionParentPath}${COLLECTION_PATH_SEPARATOR}${collectionId}`;

      // '/coll-a' -> '/coll-z/456'
      // '/coll-a/123' -> '/coll-z/456/123'
      return this.storage.queryCollections.where({ id: collectionId }) // include the collection itself
        .or('parentPath').startsWith(parentPath) // ...and its descendants
        .modify(c => {
          c.parentPath = c.parentPath?.replace(collectionParentPath, newParentSubcollectionParentPath);
        });
    });

    return observableFrom(resultPromise);
  }

  getCollectionTrees(collections: IQueryCollection[]) {
    const roots: IQueryCollectionTree[] = [];
    const collectionMap = new Map<number, IQueryCollectionTree>();

    collections.forEach(collection => {
      const collectionId = collection.id;
      if (!collectionId) {
        throw new Error('All collections must have an ID to get a tree!');
      }

      collectionMap.set(collectionId, {
        ...collection,
        id: collectionId,
        collections: [],
      });
    });

    collections.forEach(collection => {
      const collectionTree = collectionMap.get(collection.id!);
      if (!collectionTree) {
        return;
      }

      if (!collection.parentPath) {
        roots.push(collectionTree);
        return;
      }

      const parentCollectionId = collection.parentPath?.split(COLLECTION_PATH_SEPARATOR).pop();
      if (!parentCollectionId) {
        roots.push(collectionTree);
        return;
      }

      const parentCollection = collectionMap.get(+parentCollectionId);
      parentCollection?.collections.push(collectionTree);
    });

    return roots;
  }

  getCollectionTree$(collections: IQueryCollection[]) {
    return of(this.getCollectionTrees(collections));
  }

  getCollectionListFromTree(tree: IQueryCollectionTree, parentPath = ''): IQueryCollection[] {
    // remove collections and keep the rest as collection
    const { collections, ...rootCollection } = tree;
    const subcollections = collections.map(ct => this.getCollectionListFromTree(ct, `${parentPath}${COLLECTION_PATH_SEPARATOR}${tree.id}`));

    return [
      {
        ...rootCollection,
        parentPath, // set the parent path
      },
      ...subcollections.flat(),
    ];
  }

  async getCollectionTreeByCollectionId(collectionId: CollectionID) {
    const collection = await this.storage.queryCollections.get(collectionId);
    if (!collection) {
      throw new Error('Collection not found!');
    }
    const subcollections = await this.getSubcollections(collectionId, true);

    const [ collectionTree ] = this.getCollectionTrees([ collection, ...subcollections ]);

    return collectionTree;
  }

  /**
   * Generate parentPath for subcollections of the specified parent collection
   * @param parentCollectionId
   */
  private async getSubcollectionParentPath(parentCollectionId: CollectionID) {
    const parentCollection = await this.storage.queryCollections.get(parentCollectionId);
    const parentCollectionParentPath = parentCollection?.parentPath ?? '';

    return `${parentCollectionParentPath}${COLLECTION_PATH_SEPARATOR}${parentCollectionId}`;
  }
}
