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
import { mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { AccountService } from '../account/account.service';
import {
  addDocument,
  queriesRef,
  queryCollectionsRef,
  updateDocument,
} from '../firebase/firebase';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private accountService: AccountService) {}

  private now() {
    return Date.now();
  }

  async createQueryCollection(
    queryCollection: IQueryCollection,
    parentCollectionId?: string
  ) {
    const user = await this.accountService.mustGetUser();

    // TODO: Team collection
    // TODO: Use transaction to wrap all operations

    const collectionRes = await addDocument(queryCollectionsRef(), {
      title: queryCollection.title,
      parentCollectionId: parentCollectionId,
      ownerUid: user.uid,
      created_at: this.now(),
      updated_at: this.now(),
    });

    const queryRes = await this.createQueries(
      collectionRes.id,
      queryCollection.queries
    );

    return {
      collectionId: collectionRes.id,
      queryIds: queryRes,
    };
  }

  async createQueries(collectionServerId: string, queries: IQuery[]) {
    // TODO: Use transaction to wrap all operations
    const queryRes = [];
    for (const query of queries) {
      const res = await addDocument(queriesRef(), {
        ...query,
        windowName: query.windowName,
        version: query.version,
        collectionId: collectionServerId,
        ownerUid: (await this.accountService.mustGetUser()).uid,
        created_at: this.now(),
        updated_at: this.now(),
      });

      queryRes.push(res.id);
    }

    return queryRes;
  }

  async updateQuery(queryServerId: string, query: IQuery) {
    await updateDocument<IRemoteQuery>(doc(queriesRef(), queryServerId), query);
  }

  async deleteQuery(queryServerId: string) {
    await deleteDoc(doc(queriesRef(), queryServerId));
  }

  async updateCollection(
    collectionServerId: string,
    collection: IQueryCollection,
    parentCollectionServerId?: string
  ) {
    await updateDocument<IRemoteQueryCollection>(
      doc(queryCollectionsRef(), collectionServerId),
      {
        title: collection.title,
        parentCollectionId: parentCollectionServerId,
      }
    );
  }

  async deleteCollection(collectionServerId: string) {
    await deleteDoc(doc(queryCollectionsRef(), collectionServerId));
  }

  async getCollection(
    collectionServerId: string
  ): Promise<IQueryCollection | undefined> {
    const user = await this.accountService.mustGetUser();

    const q = query(
      queryCollectionsRef(),
      where('ownerUid', '==', user.uid),
      where(documentId(), '==', collectionServerId)
    );
    const querySnapshot = await getDocs(q);

    const queryCollectionSnapshot = querySnapshot.docs[0];

    if (!queryCollectionSnapshot) {
      return;
    }

    const docQ = query(
      queriesRef(),
      where('ownerUid', '==', user.uid),
      where('collectionId', '==', queryCollectionSnapshot.id)
    );

    const sn = await getDocs(docQ);
    const queries = sn.docs.map((_) => ({ ..._.data(), id: _.id }));

    return {
      id: queryCollectionSnapshot.id,
      ...queryCollectionSnapshot.data(),
      queries,
      storageType: 'firestore',
    };
  }

  // TODO: Handle team collections
  async getCollections(): Promise<IQueryCollection[]> {
    const user = await this.accountService.mustGetUser();
    // Get query collections where owner == uid
    // Get queries where collectionId in collection IDs
    const q = query(queryCollectionsRef(), where('ownerUid', '==', user.uid));
    const querySnapshot = await getDocs(q);

    const queryCollections = querySnapshot.docs;

    // TODO: Verify that the data() has the ID
    const collectionQueries = await Promise.allSettled(
      queryCollections.map(async (col) => {
        const docQ = query(
          queriesRef(),
          where('ownerUid', '==', user.uid),
          where('collectionId', '==', col.id)
        );

        const sn = await getDocs(docQ);
        return sn.docs.map(
          (doc): IQuery => ({
            ...doc.data(),
            id: doc.id,
            storageType: 'firestore',
          })
        );
      })
    );

    return queryCollections.map((col, idx) => {
      const queriesResult = collectionQueries[idx];
      return {
        id: col.id,
        ...col.data(),
        queries:
          queriesResult.status === 'fulfilled' ? queriesResult.value : [],
        storageType: 'firestore',
      };
    });
  }

  // TODO: Make sure to unsubscribe observables when user logs out
  listenForCollectionChanges() {
    return from(this.accountService.mustGetUser()).pipe(
      switchMap((user) => {
        // Get query collections where owner == uid
        // Get queries where collectionId in collection IDs
        const collectionQ = query(
          queryCollectionsRef(),
          where('ownerUid', '==', user.uid)
        );

        const collectionListener = fromEventPattern(
          (handler) => onSnapshot(collectionQ, handler),
          (handler, unsubscribe) => unsubscribe()
        );

        const docQ = query(queriesRef(), where('ownerUid', '==', user.uid));

        const docListener = fromEventPattern(
          (handler) => onSnapshot(docQ, handler),
          (handler, unsubscribe) => unsubscribe()
        );

        return merge(collectionListener, docListener);
      })
    );
  }
}
