import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import {
  ExportCollectionState,
  IQueryCollection,
  IQueryCollectionTree,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { debug } from '../../utils/logger';
import { getFileStr } from '../../utils';
import {
  getParentCollectionId,
  getAllParentCollections as getAllParentCollectionsUtil,
  COLLECTION_PATH_SEPARATOR,
} from '../../store/collection/utils';

/**
 * Utility service for collection operations like import/export and tree manipulation
 */
@Injectable({ providedIn: 'root' })
export class CollectionUtilsService {
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

      const parentCollectionId = getParentCollectionId(collection);
      if (!parentCollectionId || parentCollectionId === '0') {
        roots.push(collectionTree);
        return;
      }

      const parentCollection = collectionMap.get(parentCollectionId);
      parentCollection?.collections?.push(collectionTree);
    });

    return roots;
  }

  getCollectionListFromTree(
    tree: IQueryCollectionTree,
    parentPath = ''
  ): IQueryCollection[] {
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
        parentPath,
      },
      ...(subcollections || []).flat(),
    ];
  }

  remapCollectionIDsToCollectionList(
    tree: IQueryCollectionTree,
    parentPath = ''
  ): IQueryCollection[] {
    const { collections, ...rootCollection } = tree;
    rootCollection.id = uuid();
    const subcollections = collections?.map((ct) =>
      this.remapCollectionIDsToCollectionList(
        ct,
        `${parentPath}${COLLECTION_PATH_SEPARATOR}${rootCollection.id}`
      )
    );

    return [
      {
        ...rootCollection,
        parentPath,
      },
      ...(subcollections || []).flat(),
    ];
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

  importCollectionData(data: ExportCollectionState) {
    try {
      if (!data) {
        throw new Error('Object is empty.');
      }
      if (!data.version || !data.type || data.type !== 'collection') {
        throw new Error('File is not a valid Altair collection file.');
      }

      return this.remapCollectionIDsToCollectionList(data);
    } catch (err) {
      debug.log('Something went wrong while importing the data.', err);
      throw err;
    }
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

  /**
   * Uses utility functions from store/collection/utils.ts
   */
  getParentCollectionId(collection: IQueryCollection) {
    return getParentCollectionId(collection);
  }

  /**
   * Uses utility functions from store/collection/utils.ts
   */
  getAllParentCollections(
    collections: IQueryCollection[],
    collection: IQueryCollection
  ) {
    return getAllParentCollectionsUtil(collections, collection);
  }
}
