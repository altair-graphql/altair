import { Injectable, inject } from '@angular/core';
import { v4 as uuid } from 'uuid';
import {
  IQuery,
  IQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { StorageService } from '../storage/storage.service';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';
import { WORKSPACES } from 'altair-graphql-core/build/types/state/workspace.interface';

type CollectionID = number | string;
type QueryID = string;
const COLLECTION_PATH_SEPARATOR = '/';

/**
 * Service for managing local query collections stored in IndexedDB
 */
@Injectable({ providedIn: 'root' })
export class LocalCollectionService {
  private storage = inject(StorageService);

  async createCollection(
    collection: CreateDTO<IQueryCollection>,
    collectionId?: string,
    parentCollectionId?: CollectionID
  ) {
    const now = this.storage.now();
    let parentPath = '';
    if (parentCollectionId) {
      parentPath = await this.getSubcollectionParentPath(parentCollectionId);
    }

    collection.queries = collection.queries.map((query) => {
      return {
        ...query,
        storageType: 'local',
        id: uuid(),
        created_at: now,
        updated_at: now,
      };
    });

    return this.storage.queryCollections.add({
      ...collection,
      storageType: 'local',
      workspaceId: WORKSPACES.LOCAL,
      id: collectionId ?? uuid(),
      parentPath,
      created_at: now,
      updated_at: now,
    });
  }

  async addQuery(collectionId: CollectionID, query: IQuery) {
    const now = this.storage.now();
    const id = uuid();
    await this.updateCollectionByID(collectionId, (collection) => {
      const uQuery = { ...query, id, created_at: now, updated_at: now };
      collection.queries.push(uQuery);
    });

    return id;
  }

  async updateQuery(collectionId: CollectionID, queryId: QueryID, query: IQuery) {
    const now = this.storage.now();
    return this.updateCollectionByID(collectionId, (collection) => {
      const uQuery = { ...query, id: queryId, updated_at: now };
      collection.queries = collection.queries.map((collectionQuery) => {
        if (collectionQuery.id === queryId) {
          collectionQuery = { ...collectionQuery, ...uQuery };
        }
        return collectionQuery;
      });
    });
  }

  async deleteQuery(collectionId: CollectionID, query: IQuery) {
    return this.updateCollectionByID(collectionId, (collection) => {
      collection.queries = collection.queries.filter((collectionQuery) => {
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
    });
  }

  async deleteCollection(collectionId: CollectionID) {
    await this.storage.queryCollections.delete(collectionId);
    await this.storage.queryCollections.delete(
      this.getAlternateCollectionID(collectionId)
    );
    const subcollections = await this.getSubcollections(collectionId);
    for (let i = 0; i < subcollections.length; i++) {
      const subcollection = subcollections[i];
      if (subcollection?.id) {
        await this.storage.queryCollections.delete(subcollection.id);
      }
    }
  }

  async updateCollection(
    collectionId: CollectionID,
    modifiedCollection: IQueryCollection
  ) {
    return this.updateCollectionByID(collectionId, (collection, ctx) => {
      ctx.value = modifiedCollection;
      ctx.value.updated_at = this.storage.now();
    });
  }

  async getCollectionByID(collectionId: CollectionID) {
    const localCollection = await this.storage.queryCollections.get(collectionId);
    if (!localCollection) {
      collectionId = this.getAlternateCollectionID(collectionId);
    }
    return await this.storage.queryCollections.get(collectionId);
  }

  async getQuery(collectionId: CollectionID, queryId: QueryID) {
    const localCollection = await this.getCollectionByID(collectionId);
    if (localCollection) {
      return localCollection.queries.find((query) => query.id === queryId);
    }
  }

  async getAll() {
    return this.storage.queryCollections.toArray();
  }

  async getSubcollections(
    collectionId: CollectionID,
    recursive = false
  ): Promise<IQueryCollection[]> {
    const parentPath = await this.getSubcollectionParentPath(collectionId);
    const whereClause = this.storage.queryCollections.where('parentPath');

    if (recursive) {
      return whereClause.startsWith(parentPath).toArray();
    }
    return whereClause.equals(parentPath).toArray();
  }

  async moveCollection(
    collectionId: CollectionID,
    newParentCollectionId: CollectionID
  ) {
    return this.storage.transaction(
      'rw',
      this.storage.queryCollections,
      async () => {
        const collection = await this.getCollectionByID(collectionId);
        if (!collection) {
          throw new Error('Could not retrieve collection');
        }

        const newParentCollection =
          await this.getCollectionByID(newParentCollectionId);
        if (!newParentCollection) {
          throw new Error('Could not retrieve parent collection');
        }
        const newParentCollectionParentPath = newParentCollection.parentPath ?? '';
        const newParentSubcollectionParentPath = `${newParentCollectionParentPath}${COLLECTION_PATH_SEPARATOR}${newParentCollectionId}`;

        const collectionParentPath = collection.parentPath ?? '';
        const parentPath = `${collectionParentPath}${COLLECTION_PATH_SEPARATOR}${collectionId}`;

        return this.storage.queryCollections
          .where({ id: collectionId })
          .or('id')
          .equals(this.getAlternateCollectionID(collectionId))
          .or('parentPath')
          .startsWith(parentPath)
          .modify((c) => {
            c.parentPath = c.parentPath?.replace(
              collectionParentPath,
              newParentSubcollectionParentPath
            );
          });
      }
    );
  }

  private getAlternateCollectionID(collectionId: CollectionID) {
    let alternateCollectionId: number | string = '';
    if (typeof collectionId === 'number') {
      alternateCollectionId = `${collectionId}`;
    }
    if (typeof collectionId === 'string') {
      alternateCollectionId = Number(collectionId);
      if (isNaN(alternateCollectionId)) {
        alternateCollectionId = '';
      }
    }

    return alternateCollectionId;
  }

  private async updateCollectionByID(
    collectionId: CollectionID,
    changeCb: (
      obj: IQueryCollection,
      ctx: { value: IQueryCollection }
    ) => boolean | void
  ) {
    const alternateCollectionId = this.getAlternateCollectionID(collectionId);
    return this.storage.queryCollections
      .where('id')
      .equals(collectionId)
      .or('id')
      .equals(alternateCollectionId)
      .modify(changeCb);
  }

  private async getSubcollectionParentPath(parentCollectionId: CollectionID) {
    const parentCollection = await this.getCollectionByID(parentCollectionId);
    const parentCollectionParentPath = parentCollection?.parentPath ?? '';

    return `${parentCollectionParentPath}${COLLECTION_PATH_SEPARATOR}${parentCollectionId}`;
  }
}
