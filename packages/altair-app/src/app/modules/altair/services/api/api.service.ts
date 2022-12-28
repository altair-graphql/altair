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
import { Observable, from, fromEventPattern, merge } from 'rxjs';
import { mergeMap, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';
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
} from 'altair-firebase-utils';
import { debug } from '../../utils/logger';
import { AccountService } from '../account/account.service';
import { firebaseClient } from '../firebase/firebase';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';
import { TeamId } from 'altair-graphql-core/build/types/state/account.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private accountService: AccountService) {}

  private async ctx() {
    const user = await this.accountService.mustGetUser();
    return createUtilsContext(user, firebaseClient.db);
  }

  async createQueryCollection(
    queryCollection: CreateDTO<IQueryCollection>,
    parentCollectionId?: string,
    teamId?: TeamId
  ) {
    return createQueryCollection(
      await this.ctx(),
      queryCollection,
      parentCollectionId,
      teamId
    );
  }

  async createQueries(collectionServerId: string, queries: IQuery[]) {
    return createQueries(await this.ctx(), collectionServerId, queries);
  }

  async updateQuery(queryServerId: string, query: IQuery) {
    return updateQuery(await this.ctx(), queryServerId, query);
  }

  async deleteQuery(queryServerId: string) {
    return deleteQuery(await this.ctx(), queryServerId);
  }

  async updateCollection(
    collectionServerId: string,
    collection: IQueryCollection,
    parentCollectionServerId?: string
  ) {
    return updateCollection(
      await this.ctx(),
      collectionServerId,
      collection,
      parentCollectionServerId
    );
  }

  async deleteCollection(collectionServerId: string) {
    return deleteCollection(await this.ctx(), collectionServerId);
  }

  async getCollection(
    collectionServerId: string
  ): Promise<IQueryCollection | undefined> {
    return getCollection(await this.ctx(), collectionServerId);
  }

  async getCollections(): Promise<IQueryCollection[]> {
    return getCollections(await this.ctx());
  }

  // TODO: Handle team collections
  async listenForCollectionChanges() {
    const ctx = await this.ctx();
    const teams = await getTeams(ctx);
    return from(this.accountService.mustGetUser()).pipe(
      switchMap((user) => {
        debug.log('to listen for collection changes...');
        const listeners = [];
        // Get query collections where owner == uid
        // Get queries where collectionId in collection IDs
        const collectionQ = query(
          queryCollectionsRef(ctx.db),
          where('ownerUid', '==', user.uid)
        );

        const collectionListener = fromEventPattern(
          (handler) => onSnapshot(collectionQ, handler),
          (handler, unsubscribe) => unsubscribe()
        );
        listeners.push(collectionListener);

        if (teams.length) {
          const teamCollectionQ = query(
            queryCollectionsRef(ctx.db),
            where(
              'teamOwnerUid',
              'in',
              teams.map((t) => t.id)
            )
          );

          const teamCollectionListener = fromEventPattern(
            (handler) => onSnapshot(teamCollectionQ, handler),
            (handler, unsubscribe) => unsubscribe()
          );
          listeners.push(teamCollectionListener);
        }

        const docQ = query(
          queriesRef(ctx.db),
          where('ownerUid', '==', user.uid)
        );

        const docListener = fromEventPattern(
          (handler) => onSnapshot(docQ, handler),
          (handler, unsubscribe) => unsubscribe()
        );
        listeners.push(docListener);

        // Unsubscribe observables when user logs out
        return merge(listeners).pipe(
          takeUntil(this.accountService.observeSignout())
        );
      })
    );
  }
}
