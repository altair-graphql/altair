import { Injectable } from '@angular/core';
import {
  doc,
  deleteDoc,
  getDocs,
  query,
  where,
  FieldPath,
  documentId,
  onSnapshot,
} from '@firebase/firestore';
import {
  IQuery,
  IQueryCollection,
  IRemoteQuery,
  IRemoteQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { Observable, from, fromEventPattern, merge, EMPTY } from 'rxjs';
import {
  map,
  mergeMap,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import ky from 'ky';
import {
  createQueries,
  createQueryCollection,
  createUtilsContext,
  deleteCollection,
  deleteQuery,
  getCollection,
  getCollections,
  getTeams,
  queriesRef,
  queryCollectionsRef,
  updateCollection,
  updateQuery,
  FullQueryCollection,
} from '@altairgraphql/firebase-utils';
import { debug } from '../../utils/logger';
import { AccountService } from '../account/account.service';
import { firebaseClient } from '../firebase/firebase';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';
import { TeamId } from 'altair-graphql-core/build/types/state/account.interfaces';
import { environment } from 'environments/environment';
import { KyInstance } from 'ky/distribution/types/ky';
import { QueryItem } from '@prisma/client';

const serverQueryToLocalQuery = (query: QueryItem): IQuery => {
  return {
    ...(query.content as unknown as IQuery),
    id: query.id,
    created_at: +query.createdAt,
    updated_at: +query.updatedAt,
  };
};
const serverCollectionToLocalCollection = (
  collection: FullQueryCollection
): IQueryCollection => {
  return {
    id: collection.id,
    title: collection.name,
    queries: collection.queries.map(serverQueryToLocalQuery),
    storageType: 'api',
  };
};
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private accountService: AccountService) {}

  async createQueryCollection(
    queryCollection: CreateDTO<IQueryCollection>,
    parentCollectionId?: string,
    teamId?: TeamId
  ) {
    return await firebaseClient.apiClient.createQueryCollection({
      name: queryCollection.title,
      queries: queryCollection.queries.map((q) => ({
        name: q.windowName,
        content: {
          ...q,
          collectionId: '',
        },
        collectionId: '',
      })),
    });
  }

  async createQuery(collectionServerId: string, query: IQuery) {
    return await firebaseClient.apiClient.createQuery({
      collectionId: collectionServerId,
      name: query.windowName,
      content: {
        ...query,
        collectionId: collectionServerId,
      },
    });
  }

  async updateQuery(queryServerId: string, query: IQuery) {
    return await firebaseClient.apiClient.updateQuery(queryServerId, {
      name: query.windowName,
      content: {
        ...query,
        collectionId: query.collectionId || '',
      },
    });
  }

  async deleteQuery(queryServerId: string) {
    return await firebaseClient.apiClient.deleteQuery(queryServerId);
  }

  async updateCollection(
    collectionServerId: string,
    collection: IQueryCollection,
    parentCollectionServerId?: string
  ) {
    return await firebaseClient.apiClient.updateCollection(collectionServerId, {
      name: collection.title,
      queries: collection.queries.map((q) => ({
        name: q.windowName,
        content: {
          ...q,
          collectionId: q.collectionId || '',
        },
        collectionId: q.collectionId || '',
      })),
    });
  }

  async deleteCollection(collectionServerId: string) {
    return await firebaseClient.apiClient.deleteCollection(collectionServerId);
  }

  async getCollection(
    collectionServerId: string
  ): Promise<IQueryCollection | undefined> {
    const res = await firebaseClient.apiClient.getCollection(
      collectionServerId
    );
    if (!res) {
      return;
    }

    return serverCollectionToLocalCollection(res);
  }

  async getCollections(): Promise<IQueryCollection[]> {
    const collections = await firebaseClient.apiClient.getCollections();
    return collections.map(serverCollectionToLocalCollection);
  }

  // TODO: Handle team collections
  listenForCollectionChanges() {
    return firebaseClient.apiClient.listenForEvents().pipe(
      map((x) => {
        return x;
      })
      // takeUntil(this.accountService.observeSignout())
    );
    // const ctx = await this.ctx();
    // const teams = await getTeams(ctx);
    // return from(this.accountService.mustGetUser()).pipe(
    //   switchMap((user) => {
    //     debug.log('to listen for collection changes...');
    //     const listeners = [];
    //     // Get query collections where owner == uid
    //     // Get queries where collectionId in collection IDs
    //     const collectionQ = query(
    //       queryCollectionsRef(ctx.db),
    //       where('ownerUid', '==', user.uid)
    //     );

    //     const collectionListener = fromEventPattern(
    //       (handler) => onSnapshot(collectionQ, handler),
    //       (handler, unsubscribe) => unsubscribe()
    //     );
    //     listeners.push(collectionListener);

    //     if (teams.length) {
    //       const teamCollectionQ = query(
    //         queryCollectionsRef(ctx.db),
    //         where(
    //           'teamOwnerUid',
    //           'in',
    //           teams.map((t) => t.id)
    //         )
    //       );

    //       const teamCollectionListener = fromEventPattern(
    //         (handler) => onSnapshot(teamCollectionQ, handler),
    //         (handler, unsubscribe) => unsubscribe()
    //       );
    //       listeners.push(teamCollectionListener);
    //     }

    //     const docQ = query(
    //       queriesRef(ctx.db),
    //       where('ownerUid', '==', user.uid)
    //     );

    //     const docListener = fromEventPattern(
    //       (handler) => onSnapshot(docQ, handler),
    //       (handler, unsubscribe) => unsubscribe()
    //     );
    //     listeners.push(docListener);

    //     // Unsubscribe observables when user logs out
    //     return merge(listeners).pipe(
    //       takeUntil(this.accountService.observeSignout())
    //     );
    //   })
    // );
    // return EMPTY;
  }
}
