
import {from as observableFrom, Observable, empty as observableEmpty, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import uuid from 'uuid/v4';
import { ExportCollectionState, IQuery, IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { StorageService } from '../storage/storage.service';
import { debug } from '../../utils/logger';
import { getFileStr } from '../../utils';

// Handling hierarchical data
// https://stackoverflow.com/questions/4048151/what-are-the-options-for-storing-hierarchical-data-in-a-relational-database
@Injectable()
export class QueryCollectionService {

  constructor(
    private storage: StorageService
  ) { }

  create(collection: IQueryCollection) {
    const now = this.storage.now();

    collection.queries = collection.queries.map((query) => {
      return { ...query, id: uuid(), created_at: now, updated_at: now }
    });
    return observableFrom(this.storage.queryCollections.add({ ...collection, created_at: now, updated_at: now }));
  }

  addQuery(collectionId: number, query: IQuery): Observable<any> {
    const now = this.storage.now();
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
        const uQuery = { ...query, id: uuid(), created_at: now, updated_at: now };
        collection.queries.push(uQuery);
        collection.updated_at = now;
      })
    );
  }

  updateQuery(collectionId: number, queryId: string, query: IQuery): Observable<any> {
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

  deleteQuery(collectionId: number, query: IQuery): Observable<any> {
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

  deleteCollection(collectionId: number) {
    return observableFrom(this.storage.queryCollections.delete(collectionId));
  }

  updateCollection(collectionId: number, modifiedCollection: IQueryCollection) {
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify((collection, ctx) => {
        debug.log('We update.');
        ctx.value = modifiedCollection;
        ctx.value.updated_at = this.storage.now();
      })
    );
  }

  getExportCollectionData(collectionId: number) {
    return observableFrom(
      this.storage.queryCollections.get({ id: collectionId }).then((collection: IQueryCollection) => {
        const exportCollectionData: ExportCollectionState = {
          version: 1,
          type: 'collection',
          ...collection
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

  importCollectionData(data: ExportCollectionState) {
    try {
      // Verify file's content
      if (!data) {
        return throwError(new Error('Object is empty.'));
      }
      if (!data.version || !data.type || data.type !== 'collection') {
        return throwError(new Error('File is not a valid Altair collection file.'));
      }

      return this.create({
        title: data.title,
        collections: data.collections,
        description: data.description,
        queries: data.queries,
      })
    } catch (err) {
      debug.log('Something went wrong while importing the data.', err);
      return throwError(err);
    }
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

}
