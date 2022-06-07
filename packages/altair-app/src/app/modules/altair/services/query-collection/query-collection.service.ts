
import {from as observableFrom, Observable, empty as observableEmpty, throwError, of } from 'rxjs';
import { Injectable } from '@angular/core';
import uuid from 'uuid/v4';
import { ExportCollectionState, IQuery, IQueryCollection, IQueryCollectionTree } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { StorageService } from '../storage/storage.service';
import { debug } from '../../utils/logger';
import { getFileStr } from '../../utils';
import { supabase } from '../api/supabase';
import { TODO } from 'altair-graphql-core/build/types/shared';

type CollectionID = number | string;
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

  async create(collection: IQueryCollection, parentCollectionId?: CollectionID) {
    const newCollectionId = await this.createLocalCollection(collection, parentCollectionId);

    // Remote - don't add to remote yet, until user explicitly syncs

    return newCollectionId;
  }

  private canApplyRemote() {
    return !!supabase.auth.user();
  }

  async createRemoteCollection(localCollectionId: CollectionID, collection: IQueryCollection) {
    if (!this.canApplyRemote()) {
      // not logged in
      return;
    }

    // Get parent collection, retrieve parent collection server id, set parent collection id in remote
    const parentCollection = await this.getParentCollection(collection);
    const parentCollectionServerId = parentCollection?.serverId;

    const { data: workspace, error: workspaceGetError } = await supabase.from('workspaces')
      .select('id')
      .single();

    if (workspaceGetError) {
      throw workspaceGetError;
    }
    const workspaceId = workspace.id;
    if (!workspaceId) {
      throw new Error('Could not retrieve your workspace');
    }

    // add collection
    const { data: requestCollections, error: collectionInsertError } = await supabase.from('request_collections')
      .insert({
        collection_name: collection.title,
        parent_collection_id: parentCollectionServerId,
        workspace_id: workspaceId,
      });

      if (collectionInsertError) {
        throw collectionInsertError;
      }
    if (!requestCollections?.length) {
      throw new Error('Could not add collection to remote');
    }
    const requestCollection = requestCollections[0];

    // add queries
    const { data: requests, error: requestInsertError } = await supabase.from('requests')
      .insert(collection.queries.map(query => ({
        name: query.windowName,
        request_version: query.version,
        content: query,
        collection_id: requestCollection.id,
      })));

    if(requestInsertError) {
      throw requestInsertError;
    }
    if (!requests?.length) {
      throw new Error('Could not add queries in collection to remote');
    }

    // Add serverId to local query and collection data
    const localCollection = await this.mustGetLocalCollection(localCollectionId);
    localCollection.serverId = requestCollection.id;
    localCollection.queries = localCollection.queries.map((query, idx) => {
      query.serverId = requests[idx].id;
      return query;
    });
    return this.updateLocalCollection(localCollectionId, localCollection);
  }

  private async createLocalCollection(collection: IQueryCollection, parentCollectionId?: CollectionID) {
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
      id: uuid(),
      parentPath,
      created_at: now,
      updated_at: now,
    });
  }

  async addQuery(collectionId: CollectionID, query: IQuery) {
    const res = await this.addLocalQuery(collectionId, query);

    const localCollection = await this.mustGetLocalCollection(collectionId);

    if (!this.canApplyRemote()) {
      // not logged in
      return;
    }
    
    if (localCollection.serverId) {
      // only add query to remote if already synced
      await this.addRemoteQuery(collectionId, [ query ]);
    }
  }

  private async addRemoteQuery(collectionId: CollectionID, queries: IQuery[]) {
    const localCollection = await this.mustGetLocalCollection(collectionId);
    const { data: requests, error: requestInsertError } = await supabase.from('requests')
      .insert(queries.map(query => ({
        name: query.windowName,
        request_version: query.version,
        content: query,
        collection_id: localCollection.serverId,
      })));

    if(requestInsertError) {
      throw requestInsertError;
    }
    if (!requests?.length) {
      throw new Error('Could not add query in collection to remote');
    }
  }

  private async addLocalQuery(collectionId: CollectionID, query: IQuery) {
    const now = this.storage.now();
    return this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
      const uQuery = { ...query, id: uuid(), created_at: now, updated_at: now };
      collection.queries.push(uQuery);
    });
  }

  async updateQuery(collectionId: CollectionID, queryId: QueryID, query: IQuery) {
    const res = await this.updateLocalQuery(collectionId, queryId, query);

    if (!this.canApplyRemote()) {
      // not logged in
      return;
    }
    const localCollection = await this.mustGetLocalCollection(collectionId);
    // only update remote if already synced
    if (!localCollection.serverId) {
      return;
    }
    const localQuery = await this.getLocalQuery(collectionId, queryId);
    if (!localQuery?.serverId) {
      return this.addRemoteQuery(collectionId, [ query ]);
    }

    const { data: requests, error: requestUpdateError } = await supabase.from('requests')
      .update({
        name: query.windowName,
        request_version: query.version,
        content: query,
      })
      .eq('id', localQuery.serverId);

    if(requestUpdateError) {
      throw requestUpdateError;
    }
    if (!requests?.length) {
      throw new Error('Could not update query in collection to remote');
    }

    return res;
  }

  private async mustGetLocalCollection(collectionId: CollectionID) {
    const localCollection = await this.storage.queryCollections.get(collectionId);
    if (!localCollection) {
      throw new Error('Could not retrieve local collection data');
    }
    return localCollection;
  }

  private async getLocalQuery(collectionId: CollectionID, queryId: QueryID) {
    const localCollection = await this.storage.queryCollections.get(collectionId);
    if (localCollection) {
      return localCollection.queries.find(query => query.id === queryId);
    }
  }

  private updateLocalQuery(collectionId: CollectionID, queryId: QueryID, query: IQuery) {
    const now = this.storage.now();
    return this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
      const uQuery = { ...query, id: queryId, updated_at: now };
      collection.queries = collection.queries.map(collectionQuery => {
        if (collectionQuery.id === queryId) {
          collectionQuery = { ...collectionQuery, ...uQuery };
        }
        return collectionQuery;
      });

      // collection.updated_at = now;
    })
  }

  async deleteQuery(collectionId: CollectionID, query: IQuery) {
    const localCollection = await this.mustGetLocalCollection(collectionId);
    const localQuery = await this.getLocalQuery(collectionId, query.id!);
    await this.deleteLocalQuery(collectionId, query);

    if (!this.canApplyRemote()) {
      // not logged in
      return;
    }
    if (!localCollection.serverId) {
      // only update remote if collection is synced
      return;
    }
    // delete query remote
    if (!query.id) {
      // ignore these cases as malformed queries
      debug.log('Query does not have id. Skipping remote check.');
      return;
    }

    if (!localQuery?.serverId) {
      debug.log('Query does not have server id. Skipping remote check.');
      return;
    }
    const { data: requests, error: requestDeleteError } = await supabase.from('requests')
    .delete()
    .eq('id', localQuery.serverId);

    if(requestDeleteError) {
      throw requestDeleteError;
    }
    if (!requests?.length) {
      throw new Error('Could not update query in collection to remote');
    }
  }

  private deleteLocalQuery(collectionId: CollectionID, query: IQuery) {
    return this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
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

      // collection.updated_at = this.storage.now();
    });
  }

  async deleteCollection(collectionId: CollectionID) {
    const localCollection = await this.mustGetLocalCollection(collectionId);
    await this.deleteLocalCollection(collectionId);
    // Note: Deleting a collection would delete all subcollections and queries inside the collection
    
    // delete collection remote
    if (!this.canApplyRemote()) {
      // not logged in
      return;
    }
    if (!localCollection.serverId) {
      debug.log('collection does not have server id. Skipping remote check.');
      return;
    }

    const { data: requestCollections, error: collectionDeleteError } = await supabase.from('request_collections')
    .delete()
    .eq('id', localCollection.serverId);

    if(collectionDeleteError) {
      throw collectionDeleteError;
    }
    if (!requestCollections?.length) {
      throw new Error('Could not delete collection in remote');
    }
  }

  deleteLocalCollection(collectionId: CollectionID) {
    return this.storage.queryCollections.delete(collectionId);
  }

  async updateCollection(collectionId: CollectionID, modifiedCollection: IQueryCollection) {
    const res = await this.updateLocalCollection(collectionId, modifiedCollection);

    const localCollection = await this.mustGetLocalCollection(collectionId);

    if (!localCollection.serverId) {
      // only update if synced
      return;
    }

    // update collection remote
    await this.updateRemoteCollection(collectionId);

    return res;
  }

  async updateRemoteCollection(collectionId: CollectionID) {
    if (!this.canApplyRemote()) {
      // not logged in
      return;
    }
    const localCollection = await this.mustGetLocalCollection(collectionId);
    const parentCollection = await this.getParentCollection(localCollection);

    const { data: requestCollections, error: collectionInsertError } = await supabase.from('request_collections')
      .update({
        collection_name: localCollection.title,
        parent_collection_id: parentCollection?.serverId,
      })
      .eq('id', localCollection.serverId);

    if (collectionInsertError) {
      throw collectionInsertError;
    }
    if (!requestCollections?.length) {
      throw new Error('Could not add collection to remote');
    }

    return requestCollections;
  }

  private updateLocalCollection(collectionId: CollectionID, modifiedCollection: IQueryCollection) {
    return this.storage.queryCollections.where('id').equals(collectionId).modify((collection, ctx) => {
      ctx.value = modifiedCollection;
      ctx.value.updated_at = this.storage.now();
    });
  }

  async getExportCollectionData(collectionId: CollectionID) {
    const collectionTree = await this.getCollectionTreeByCollectionId(collectionId);
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
      for (let i = 0; i < collections.length; i++) {
        const collection = collections[i];
        await this.create(collection);
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
      const dataStr = await getFileStr(files);
      return this.importCollectionDataFromJson(dataStr);
    } catch (error) {
      debug.log('There was an issue importing the file.', error);
    }
  }

  async getAll() {
    return this.storage.queryCollections.toArray();
  }

  async syncRemoteToLocal() {
    const timestampDiffOffset = 2 * 60 * 1000;
    if (!this.canApplyRemote()) {
      // not logged in
      return;
    }
    // https://learnsql.com/blog/do-it-in-sql-recursive-tree-traversal/
    // https://supabase.com/blog/2020/11/18/postgresql-views
    const { data: serverCollections } = await supabase
      .from('request_collections')
      .select('*, requests(*)');

    if (!serverCollections?.length) {
      return;
    }

    const localCollections = await this.getAll();

    for (const serverCollection of serverCollections) {
      const matchedCollection = localCollections.find(collection => collection.serverId === serverCollection.id);
      if (matchedCollection) {
        const serverDate = new Date(serverCollection.updated_at);
        const localDate = new Date(matchedCollection.updated_at!);
        if (serverDate.getTime() > (localDate.getTime() + timestampDiffOffset)) {
          serverCollection.requests.forEach((request: TODO) => {
            // update collection queries
            matchedCollection.queries = matchedCollection.queries.map(query => {
              if (query.serverId === request.id) {
                const serverRequestDate = new Date(request.updated_at);
                const localRequestDate = new Date(query.updated_at!);
                if (serverRequestDate.getTime() > (localRequestDate.getTime() + timestampDiffOffset)) {
                  // server content is newer
                  return {
                    ...request.content,
                    serverId: request.id,
                  };
                }
              }
              return query;
            });

            // TODO: Handle parentPath
            // matchedCollection.parentPath

            matchedCollection.title = serverCollection.collection_name;
          });
          // server content is newer
          if (matchedCollection.id) {
            await this.updateLocalCollection(matchedCollection.id, matchedCollection);
          }
        }
      } else {
        // add collection to local
        const queries = serverCollection.requests.map((request: TODO) => ({ ...request.content, serverId: request.id }));
        const localCollection: IQueryCollection = {
          title: serverCollection.collection_name,
          queries,
          serverId: serverCollection.id,
          // parentPath // TODO: Handle parentPath
        };

        await this.createLocalCollection(localCollection);
      }
    };
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

  moveCollection(collectionId: CollectionID, newParentCollectionId: CollectionID) {
    return this.moveLocalCollection(collectionId, newParentCollectionId);
    // TODO: move collection remote
  }

  /**
   * Moves a collection from its previous parent in the tree to a new parent collection
   * @param collectionId
   * @param newParentCollectionId
   */
  private async moveLocalCollection(collectionId: CollectionID, newParentCollectionId: CollectionID) {
    return this.storage.transaction('rw', this.storage.queryCollections, async () => {
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
  }

  getCollectionTrees(collections: IQueryCollection[]) {
    const roots: IQueryCollectionTree[] = [];
    const collectionMap = new Map<string, IQueryCollectionTree>();

    collections.forEach(collection => {
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

    collections.forEach(collection => {
      const collectionTree = collectionMap.get(`${collection.id}`);
      if (!collectionTree) {
        return;
      }

      if (!collection.parentPath) {
        roots.push(collectionTree);
        return;
      }

      const parentCollectionId = this.getParentCollectionId(collection);
      if (!parentCollectionId) {
        roots.push(collectionTree);
        return;
      }

      const parentCollection = collectionMap.get(parentCollectionId);
      parentCollection?.collections?.push(collectionTree);
    });

    return roots;
  }

  getParentCollectionId(collection: IQueryCollection) {
    const id = collection.parentPath?.split(COLLECTION_PATH_SEPARATOR).pop();
    return id ? id : undefined;
  }

  getParentCollection(collection: IQueryCollection) {
    const parentCollectionId = this.getParentCollectionId(collection);
    if (parentCollectionId) {
      return this.storage.queryCollections.get(parentCollectionId);
    }
  }

  getCollectionTree$(collections: IQueryCollection[]) {
    return of(this.getCollectionTrees(collections));
  }

  getCollectionListFromTree(tree: IQueryCollectionTree, parentPath = ''): IQueryCollection[] {
    // remove collections and keep the rest as collection
    const { collections, ...rootCollection } = tree;
    const subcollections = collections?.map(ct => this.getCollectionListFromTree(ct, `${parentPath}${COLLECTION_PATH_SEPARATOR}${tree.id}`));

    return [
      {
        ...rootCollection,
        parentPath, // set the parent path
      },
      ...(subcollections || []).flat(),
    ];
  }

  remapCollectionIDsToCollectionList(tree: IQueryCollectionTree, parentPath = ''): IQueryCollection[] {
    // remove collections and keep the rest as collection
    const { collections, ...rootCollection } = tree;
    // re-assign a new ID to collection
    rootCollection.id = uuid();
    // pass new ID as parentPath in sub collections
    const subcollections = collections?.map(ct => this.remapCollectionIDsToCollectionList(ct, `${parentPath}${COLLECTION_PATH_SEPARATOR}${rootCollection.id}`));

    return [
      {
        ...rootCollection,
        parentPath, // set the parent path
      },
      ...(subcollections || []).flat(),
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
