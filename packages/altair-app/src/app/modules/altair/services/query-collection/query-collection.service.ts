import { from as observableFrom, of } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import {
  ExportCollectionState,
  IRemoteQuery,
  IQuery,
  IQueryCollection,
  IQueryCollectionTree,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';
import {
  WorkspaceId,
  WORKSPACES,
} from 'altair-graphql-core/build/types/state/workspace.interface';
import { TeamId } from 'altair-graphql-core/build/types/state/account.interfaces';
import { LocalCollectionService } from './local-collection.service';
import { RemoteCollectionService } from './remote-collection.service';
import { CollectionUtilsService } from './collection-utils.service';

type CollectionID = number | string;
type QueryID = string;

/**
 * Main service for managing query collections (local and remote)
 * Delegates to specialized services for better separation of concerns
 */
@Injectable({ providedIn: 'root' })
export class QueryCollectionService {
  private localCollectionService = inject(LocalCollectionService);
  private remoteCollectionService = inject(RemoteCollectionService);
  private collectionUtils = inject(CollectionUtilsService);

  /**
   * Creates a collection in either local storage or remote API
   */
  async createCollection(
    collection: CreateDTO<IQueryCollection>,
    workspaceId = new WorkspaceId(WORKSPACES.LOCAL),
    teamId?: TeamId,
    collectionId?: string,
    parentCollectionId?: CollectionID
  ) {
    if (workspaceId.value() === WORKSPACES.LOCAL) {
      return this.localCollectionService.createCollection(
        collection,
        collectionId,
        parentCollectionId
      );
    }

    return this.remoteCollectionService.createCollection(
      collection,
      workspaceId,
      teamId
    );
  }

  async transformCollectionToRemoteCollection(collectionId: CollectionID) {
    const localCollection = await this.localCollectionService.getCollectionByID(
      collectionId
    );
    if (!localCollection) {
      throw new Error('Could not retrieve local collection data');
    }

    const resId = await this.remoteCollectionService.createCollection(
      localCollection
    );

    if (!resId) {
      throw new Error('Remote collection creation failed');
    }

    const remoteCollection = await this.remoteCollectionService.getCollectionByID(
      resId
    );
    if (!remoteCollection) {
      throw new Error('Failed to retrieve the remote collection');
    }

    if (remoteCollection.queries.length !== localCollection.queries.length) {
      throw new Error('Query count mismatch');
    }

    await this.localCollectionService.deleteCollection(collectionId);
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
      return this.remoteCollectionService.addQuery(
        collection.id.toString(),
        query
      );
    }

    return this.localCollectionService.addQuery(collectionId, query);
  }

  async updateQuery(
    collectionId: CollectionID,
    queryId: QueryID,
    query: IQuery
  ) {
    const collection = await this.getCollectionByID(collectionId);

    if (!collection) {
      return;
    }

    if (collection.storageType === 'api') {
      if (!collection.id) {
        return;
      }
      return this.remoteCollectionService.updateQuery(queryId, query);
    }

    return this.localCollectionService.updateQuery(collectionId, queryId, query);
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
      return this.remoteCollectionService.deleteQuery(query.id);
    }

    return this.localCollectionService.deleteQuery(collectionId, query);
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
      return this.remoteCollectionService.deleteCollection(
        collection.id.toString()
      );
    }

    return this.localCollectionService.deleteCollection(collectionId);
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
      return this.remoteCollectionService.updateCollection(
        collection.id.toString(),
        modifiedCollection
      );
    }

    return this.localCollectionService.updateCollection(
      collectionId,
      modifiedCollection
    );
  }

  async getCollectionByID(
    collectionId: CollectionID
  ): Promise<IQueryCollection | undefined> {
    const localCollection = await this.localCollectionService.getCollectionByID(
      collectionId
    );
    if (localCollection) {
      return localCollection;
    }

    return this.remoteCollectionService.getCollectionByID(
      collectionId.toString()
    );
  }

  async getExportCollectionData(collectionId: CollectionID) {
    const collectionTree = await this.getCollectionTreeByCollectionId(
      collectionId
    );

    if (!collectionTree) {
      throw new Error('Collection not found!');
    }

    return this.collectionUtils.getExportCollectionDataFromCollectionTree(
      collectionTree
    );
  }

  async importCollectionDataFromJson(data: string) {
    const collections = await this.collectionUtils.importCollectionDataFromJson(
      data
    );
    if (!collections) {
      return;
    }

    for (const collection of collections) {
      await this.createCollection(
        collection,
        new WorkspaceId(WORKSPACES.LOCAL),
        undefined,
        collection.id,
        this.collectionUtils.getParentCollectionId(collection)
      );
    }
  }

  async importCollectionData(data: ExportCollectionState) {
    const collections = this.collectionUtils.importCollectionData(data);

    for (const collection of collections) {
      await this.createCollection(
        collection,
        new WorkspaceId(WORKSPACES.LOCAL),
        undefined,
        collection.id,
        this.collectionUtils.getParentCollectionId(collection)
      );
    }
  }

  importCollectionData$(data: ExportCollectionState) {
    return observableFrom(this.importCollectionData(data));
  }

  async handleImportedFile(files: FileList) {
    const collections = await this.collectionUtils.handleImportedFile(files);
    if (!collections) {
      return;
    }

    for (const collection of collections) {
      await this.createCollection(
        collection,
        new WorkspaceId(WORKSPACES.LOCAL),
        undefined,
        collection.id,
        this.collectionUtils.getParentCollectionId(collection)
      );
    }
  }

  async getAll(includeRemote = true) {
    const localCollections = await this.localCollectionService.getAll();

    if (includeRemote) {
      const remoteCollections = await this.remoteCollectionService.getAll();
      return [...localCollections, ...remoteCollections];
    }

    return localCollections;
  }

  async getSubcollections(
    collectionId: CollectionID,
    recursive = false
  ): Promise<IQueryCollection[]> {
    return this.localCollectionService.getSubcollections(collectionId, recursive);
  }

  getSubcollections$(collectionId: CollectionID, recursive = false) {
    return observableFrom(this.getSubcollections(collectionId, recursive));
  }

  moveCollection(
    collectionId: CollectionID,
    newParentCollectionId: CollectionID
  ) {
    return this.localCollectionService.moveCollection(
      collectionId,
      newParentCollectionId
    );
    // TODO: move collection remote
  }

  getCollectionTrees(collections: IQueryCollection[]) {
    return this.collectionUtils.getCollectionTrees(collections);
  }

  getCollectionTree$(collections: IQueryCollection[]) {
    return of(this.collectionUtils.getCollectionTrees(collections));
  }

  async getCollectionTreeByCollectionId(collectionId: CollectionID) {
    const collection = await this.getCollectionByID(collectionId);
    if (!collection) {
      throw new Error('Collection not found!');
    }
    const subcollections = await this.getSubcollections(collectionId, true);

    const [collectionTree] = this.collectionUtils.getCollectionTrees([
      collection,
      ...subcollections,
    ]);

    return collectionTree;
  }

  // Delegating methods for backward compatibility with tests and other code

  async getLocalCollectionByID(collectionId: CollectionID) {
    return this.localCollectionService.getCollectionByID(collectionId);
  }

  getParentCollectionId(collection: IQueryCollection) {
    return this.collectionUtils.getParentCollectionId(collection);
  }

  async getParentCollection(collection: IQueryCollection) {
    const parentCollectionId = this.getParentCollectionId(collection);
    if (parentCollectionId) {
      return this.localCollectionService.getCollectionByID(parentCollectionId);
    }
  }

  async getAllParentCollections(collection: IQueryCollection) {
    const collections: IQueryCollection[] = [];
    let curCollection = collection;
    for (; ;) {
      const parentCollection = await this.getParentCollection(curCollection);
      if (!parentCollection) {
        return collections;
      }

      collections.push(parentCollection);
      curCollection = parentCollection;
    }
  }

  getCollectionListFromTree(
    tree: IQueryCollectionTree,
    parentPath = ''
  ): IQueryCollection[] {
    return this.collectionUtils.getCollectionListFromTree(tree, parentPath);
  }

  remapCollectionIDsToCollectionList(
    tree: IQueryCollectionTree,
    parentPath = ''
  ): IQueryCollection[] {
    return this.collectionUtils.remapCollectionIDsToCollectionList(tree, parentPath);
  }

  getExportCollectionDataFromCollectionTree(collectionTree: IQueryCollectionTree) {
    return this.collectionUtils.getExportCollectionDataFromCollectionTree(
      collectionTree
    );
  }
}
