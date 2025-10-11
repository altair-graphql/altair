import { from as observableFrom, of } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { v4 as uuid } from 'uuid';
import {
  ExportCollectionState,
  IRemoteQuery,
  IQuery,
  IQueryCollection,
  IQueryCollectionTree,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { StorageService } from '../storage/storage.service';
import { debug } from '../../utils/logger';
import { getFileStr, str } from '../../utils';
import { ApiService } from '../api/api.service';
import { AccountService } from '../account/account.service';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';
import {
  WorkspaceId,
  WORKSPACES,
} from 'altair-graphql-core/build/types/state/workspace.interface';
import { TeamId } from 'altair-graphql-core/build/types/state/account.interfaces';

type CollectionID = number | string;
type QueryID = string;
const COLLECTION_PATH_SEPARATOR = '/';

// Handling hierarchical data
// https://stackoverflow.com/questions/4048151/what-are-the-options-for-storing-hierarchical-data-in-a-relational-database
// https://github.com/dexie/Dexie.js/issues/749
@Injectable()
export class QueryCollectionService {
  private storage = inject(StorageService);
  private api = inject(ApiService);
  private accountService = inject(AccountService);


  /**
   *
   * @param collection
   * @param collectionId collection ID to use when creating collection. This is used for cases where we have already generated a unique ID
   * @param parentCollectionId
   * @returns
   */
  async createCollection(
    collection: CreateDTO<IQueryCollection>,
    workspaceId = new WorkspaceId(WORKSPACES.LOCAL),
    teamId?: TeamId,
    collectionId?: string,
    parentCollectionId?: CollectionID
  ) {
    if (workspaceId.value() === WORKSPACES.LOCAL) {
      return this.createLocalCollection(
        collection,
        collectionId,
        parentCollectionId
      );
    }

    return this.createRemoteCollection(collection, workspaceId, teamId);
  }

  private async canApplyRemote() {
    return !!(await this.accountService.getUser());
  }

  async createRemoteCollection(
    collection: CreateDTO<IQueryCollection> | IQueryCollection,
    workspaceId?: WorkspaceId,
    teamId?: TeamId
  ) {
    if (!(await this.canApplyRemote())) {
      // not logged in
      return;
    }

    const res = await this.api.createQueryCollection(
      collection,
      // root collection has no parent collection ID
      undefined,
      workspaceId,
      teamId
    );

    if (!res) {
      throw new Error('could not create the collection');
    }

    if ('id' in collection) {
      // Create subcollections
      const subcollections = await this.getSubcollections(collection.id);
      for (let i = 0; i < subcollections.length; i++) {
        const subcollection = subcollections[i];
        if (subcollection?.id) {
          await this.api.createQueryCollection(
            subcollection,
            res.id,
            workspaceId,
            teamId
          );
        }
      }
    }

    return res.id;
  }

  private async createLocalCollection(
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

  async transformCollectionToRemoteCollection(collectionId: CollectionID) {
    if (!(await this.canApplyRemote())) {
      // not logged in
      return;
    }
    // Get local collection
    // Create remote collection
    // Delete local collection
    const localCollection = await this.mustGetLocalCollection(collectionId);
    const resId = await this.createRemoteCollection(localCollection);

    // Verify remote collection is created properly before deleting it
    if (!resId) {
      throw new Error('Remote collection creation failed');
    }

    // Verify all subqueries and their content
    const remoteCollection = await this.api.getCollection(resId);
    if (!remoteCollection) {
      throw new Error('Failed to retrieve the remote collection');
    }

    if (remoteCollection.queries.length !== localCollection.queries.length) {
      throw new Error('Query count mismatch');
    }
    await this.deleteLocalCollection(collectionId);
  }

  async addQuery(collectionId: CollectionID, query: IQuery | IRemoteQuery) {
    const collection = await this.getCollectionByID(collectionId);

    if (!collection) {
      return;
    }

    if (collection.storageType === 'api') {
      if (!collection.id) {
        return;
      }
      if (!(await this.canApplyRemote())) {
        // not logged in
        return;
      }

      const res = await this.api.createQuery(collection.id.toString(), query);
      return res?.id;
    }

    return await this.addLocalQuery(collectionId, query);
  }

  private async addLocalQuery(collectionId: CollectionID, query: IQuery) {
    const now = this.storage.now();
    const id = uuid();
    await this.updateLocalCollectionByID(collectionId, (collection) => {
      const uQuery = { ...query, id, created_at: now, updated_at: now };
      collection.queries.push(uQuery);
    });

    return id;
  }

  async updateQuery(collectionId: CollectionID, queryId: QueryID, query: IQuery) {
    const collection = await this.getCollectionByID(collectionId);

    if (!collection) {
      return;
    }

    if (collection.storageType === 'api') {
      if (!collection.id) {
        return;
      }
      if (!(await this.canApplyRemote())) {
        // not logged in
        return;
      }

      return this.api.updateQuery(queryId, query);
    }
    return this.updateLocalQuery(collectionId, queryId, query);
  }

  private getAlternateCollectionID(collectionId: CollectionID) {
    let alternateCollectionId: number | string = '';
    if (typeof collectionId === 'number') {
      alternateCollectionId = `${collectionId}`;
    }
    if (typeof collectionId === 'string') {
      alternateCollectionId = Number(collectionId);
      if (isNaN(alternateCollectionId)) {
        // we don't want to query with NaN as ID
        alternateCollectionId = '';
      }
    }

    return alternateCollectionId;
  }

  async getLocalCollectionByID(collectionId: CollectionID) {
    const localCollection = await this.storage.queryCollections.get(collectionId);
    if (!localCollection) {
      collectionId = this.getAlternateCollectionID(collectionId);
    }
    return await this.storage.queryCollections.get(collectionId);
  }

  async getCollectionByID(
    collectionId: CollectionID
  ): Promise<IQueryCollection | undefined> {
    const localCollection = await this.getLocalCollectionByID(collectionId);
    if (localCollection) {
      return localCollection;
    }

    if (await this.canApplyRemote()) {
      return this.api.getCollection(collectionId.toString());
    }
  }

  private async updateLocalCollectionByID(
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

  private async mustGetLocalCollection(collectionId: CollectionID) {
    const localCollection = await this.getLocalCollectionByID(collectionId);
    if (!localCollection) {
      throw new Error('Could not retrieve local collection data');
    }
    return localCollection;
  }

  private async getLocalQuery(collectionId: CollectionID, queryId: QueryID) {
    const localCollection = await this.getLocalCollectionByID(collectionId);
    if (localCollection) {
      return localCollection.queries.find((query) => query.id === queryId);
    }
  }

  private updateLocalQuery(
    collectionId: CollectionID,
    queryId: QueryID,
    query: IQuery
  ) {
    const now = this.storage.now();
    return this.updateLocalCollectionByID(collectionId, (collection) => {
      const uQuery = { ...query, id: queryId, updated_at: now };
      collection.queries = collection.queries.map((collectionQuery) => {
        if (collectionQuery.id === queryId) {
          collectionQuery = { ...collectionQuery, ...uQuery };
        }
        return collectionQuery;
      });

      // collection.updated_at = now;
    });
  }

  async deleteQuery(collectionId: CollectionID, query: IQuery) {
    const collection = await this.getCollectionByID(collectionId);

    if (!collection) {
      return;
    }

    if (collection.storageType === 'api') {
      if (!query.id) {
        return;
      }
      if (!(await this.canApplyRemote())) {
        // not logged in
        return;
      }

      return this.api.deleteQuery(query.id);
    }

    return await this.deleteLocalQuery(collectionId, query);
  }

  private deleteLocalQuery(collectionId: CollectionID, query: IQuery) {
    return this.updateLocalCollectionByID(collectionId, (collection) => {
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

      // collection.updated_at = this.storage.now();
    });
  }

  async deleteCollection(collectionId: CollectionID) {
    const collection = await this.getCollectionByID(collectionId);

    if (!collection) {
      return;
    }

    if (collection.storageType === 'api') {
      if (!collection.id) {
        return;
      }
      if (!(await this.canApplyRemote())) {
        // not logged in
        return;
      }

      return this.api.deleteCollection(collection.id.toString());
    }
    return this.deleteLocalCollection(collectionId);
  }

  async deleteLocalCollection(collectionId: CollectionID) {
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
    const collection = await this.getCollectionByID(collectionId);

    if (!collection) {
      return;
    }

    if (collection.storageType === 'api') {
      if (!collection.id) {
        return;
      }
      if (!(await this.canApplyRemote())) {
        // not logged in
        return;
      }

      return this.api.updateCollection(collection.id.toString(), modifiedCollection);
    }
    return this.updateLocalCollection(collectionId, modifiedCollection);
  }

  private updateLocalCollection(
    collectionId: CollectionID,
    modifiedCollection: IQueryCollection
  ) {
    return this.updateLocalCollectionByID(collectionId, (collection, ctx) => {
      ctx.value = modifiedCollection;
      ctx.value.updated_at = this.storage.now();
    });
  }

  async getExportCollectionData(collectionId: CollectionID) {
    const collectionTree = await this.getCollectionTreeByCollectionId(collectionId);

    if (!collectionTree) {
      throw new Error('Collection not found!');
    }

    return this.getExportCollectionDataFromCollectionTree(collectionTree);
  }

  getExportCollectionDataFromCollectionTree(collectionTree: IQueryCollectionTree) {
    const exportCollectionData: ExportCollectionState = {
      version: 1,
      type: 'collection',
      ...collectionTree,
    };
    return exportCollectionData;
  }

  async importCollectionDataFromJson(data: string) {
    if (!data) {
      throw new Error('String is empty.');
    }

    try {
      return this.importCollectionData(JSON.parse(data));
    } catch (err) {
      debug.log('The file is invalid.', err);
      throw err;
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

      const collections = this.remapCollectionIDsToCollectionList(data);
      for (const collection of collections) {
        await this.createCollection(
          collection,
          new WorkspaceId(WORKSPACES.LOCAL),
          undefined,
          collection.id,
          this.getParentCollectionId(collection)
        );
      }
    } catch (err) {
      debug.log('Something went wrong while importing the data.', err);
      throw err;
    }
  }

  importCollectionData$(data: ExportCollectionState) {
    return observableFrom(this.importCollectionData(data));
  }

  async handleImportedFile(files: FileList) {
    try {
      const file = files[0];
      if (!file) {
        debug.log('No file specified');
        return;
      }
      const dataStr = await getFileStr(file);
      return this.importCollectionDataFromJson(dataStr);
    } catch (error) {
      debug.log('There was an issue importing the file.', error);
    }
  }

  async getAll(includeRemote = true) {
    const localCollections = await this.storage.queryCollections.toArray();

    if (includeRemote && (await this.canApplyRemote())) {
      const remoteCollections = await this.api.getCollections();
      return [...localCollections, ...remoteCollections];
    }

    return localCollections;
  }

  /**
   *
   * @param collectionId the parent collection ID
   * @param recursive determines if all the descendants (sub collections of sub collections) should be retrieved
   */
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

  getSubcollections$(collectionId: CollectionID, recursive = false) {
    observableFrom(this.getSubcollections(collectionId, recursive));
  }

  moveCollection(collectionId: CollectionID, newParentCollectionId: CollectionID) {
    return this.moveLocalCollection(collectionId, newParentCollectionId);
    // TODO: move collection remote
  }

  /**
   * Moves a collection from its previous parent in the tree to a new parent collection
   * @param collectionId
   * @param newParentCollectionId
   */
  private async moveLocalCollection(
    collectionId: CollectionID,
    newParentCollectionId: CollectionID
  ) {
    return this.storage.transaction(
      'rw',
      this.storage.queryCollections,
      async () => {
        const collection = await this.getLocalCollectionByID(collectionId);
        if (!collection) {
          throw new Error('Could not retrieve collection');
        }

        // '/coll-z', id: 456
        const newParentCollection =
          await this.getLocalCollectionByID(newParentCollectionId);
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
        return this.storage.queryCollections
          .where({ id: collectionId })
          .or('id')
          .equals(this.getAlternateCollectionID(collectionId)) // include the collection itself
          .or('parentPath')
          .startsWith(parentPath) // ...and its descendants
          .modify((c) => {
            c.parentPath = c.parentPath?.replace(
              collectionParentPath,
              newParentSubcollectionParentPath
            );
          });
      }
    );
  }

  getCollectionTrees(collections: IQueryCollection[]) {
    const roots: IQueryCollectionTree[] = [];
    const collectionMap = new Map<string, IQueryCollectionTree>();

    collections.forEach((collection) => {
      const collectionId = collection.id;
      if (!collectionId) {
        throw new Error('All collections must have an ID to get a tree!');
      }

      collectionMap.set(`${collectionId}`, {
        ...collection,
        id: `${collectionId}`,
        collections: [],
      });
    });

    collections.forEach((collection) => {
      const collectionTree = collectionMap.get(`${collection.id}`);
      if (!collectionTree) {
        return;
      }

      if (!collection.parentPath) {
        roots.push(collectionTree);
        return;
      }

      const parentCollectionId = this.getParentCollectionId(collection);
      if (!parentCollectionId || parentCollectionId === '0') {
        roots.push(collectionTree);
        return;
      }

      const parentCollection = collectionMap.get(parentCollectionId);
      parentCollection?.collections?.push(collectionTree);
    });

    return roots;
  }

  getParentCollectionId(collection: IQueryCollection) {
    const id = collection.parentPath?.split(COLLECTION_PATH_SEPARATOR)?.pop();
    return id ? id : undefined;
  }

  getParentCollection(collection: IQueryCollection) {
    const parentCollectionId = this.getParentCollectionId(collection);
    if (parentCollectionId) {
      return this.getLocalCollectionByID(parentCollectionId);
    }
  }

  // TODO: Refactor to use functions from store/collection/utils.ts, instead of duplicating them here
  async getAllParentCollections(collection: IQueryCollection) {
    const collections: IQueryCollection[] = [];
    let curCollection = collection;
    for (;;) {
      const parentCollection = await this.getParentCollection(curCollection);
      if (!parentCollection) {
        return collections;
      }

      collections.push(parentCollection);
      curCollection = parentCollection;
    }
  }

  getCollectionTree$(collections: IQueryCollection[]) {
    return of(this.getCollectionTrees(collections));
  }

  getCollectionListFromTree(
    tree: IQueryCollectionTree,
    parentPath = ''
  ): IQueryCollection[] {
    // remove collections and keep the rest as collection
    const { collections, ...rootCollection } = tree;
    const subcollections = collections?.map((ct) =>
      this.getCollectionListFromTree(
        ct,
        `${parentPath}${COLLECTION_PATH_SEPARATOR}${tree.id}`
      )
    );

    return [
      {
        ...rootCollection,
        parentPath, // set the parent path
      },
      ...(subcollections || []).flat(),
    ];
  }

  remapCollectionIDsToCollectionList(
    tree: IQueryCollectionTree,
    parentPath = ''
  ): IQueryCollection[] {
    // remove collections and keep the rest as collection
    const { collections, ...rootCollection } = tree;
    // re-assign a new ID to collection
    rootCollection.id = uuid();
    // pass new ID as parentPath in sub collections
    const subcollections = collections?.map((ct) =>
      this.remapCollectionIDsToCollectionList(
        ct,
        `${parentPath}${COLLECTION_PATH_SEPARATOR}${rootCollection.id}`
      )
    );

    return [
      {
        ...rootCollection,
        parentPath, // set the parent path
      },
      ...(subcollections || []).flat(),
    ];
  }

  async getCollectionTreeByCollectionId(collectionId: CollectionID) {
    const collection = await this.getCollectionByID(collectionId);
    if (!collection) {
      throw new Error('Collection not found!');
    }
    const subcollections = await this.getSubcollections(collectionId, true);

    const [collectionTree] = this.getCollectionTrees([
      collection,
      ...subcollections,
    ]);

    return collectionTree;
  }

  /**
   * Generate parentPath for subcollections of the specified parent collection
   * @param parentCollectionId
   */
  private async getSubcollectionParentPath(parentCollectionId: CollectionID) {
    const parentCollection = await this.getLocalCollectionByID(parentCollectionId);
    const parentCollectionParentPath = parentCollection?.parentPath ?? '';

    return `${parentCollectionParentPath}${COLLECTION_PATH_SEPARATOR}${parentCollectionId}`;
  }
}
