import { Injectable } from '@angular/core';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from '@firebase/auth';
import { doc, deleteDoc, getDocs, query, where } from '@firebase/firestore';
import {
  IQuery,
  IQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { from } from 'rxjs';
import {
  addDocument,
  auth,
  queriesRef,
  queryCollectionsRef,
  updateDocument,
  usersRef,
} from './firebase';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor() {}

  private now() {
    return Date.now();
  }

  async accountLogin() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);

    await updateDocument(doc(usersRef(), cred.user.uid), {
      name: cred.user.displayName || cred.user.email || '',
      email: cred.user.email || '',
      createdAt: this.now(),
      updatedAt: this.now(),
    });

    return cred;
  }

  accountLogin$() {
    return from(this.accountLogin());
  }

  getUser() {
    return new Promise<User | null>((resolve) => {
      const cleanup = onAuthStateChanged(auth, (user) => {
        resolve(user);
      });

      return cleanup();
    });
  }

  async mustGetUser() {
    const user = await this.getUser();
    if (!user) {
      throw new Error(
        'User was expected but is undefined. Ensure you are logged in.'
      );
    }

    return user;
  }

  async logout() {
    return signOut(auth);
  }

  async isUserSignedIn() {
    return !!(await this.getUser());
  }

  async createQueryCollection(
    queryCollection: IQueryCollection,
    parentCollectionId?: string
  ) {
    const user = await this.mustGetUser();

    // TODO: Team collection
    // TODO: Use transaction to wrap all operations

    const collectionRes = await addDocument(queryCollectionsRef(), {
      collectionName: queryCollection.title,
      parentCollectionId: parentCollectionId,
      ownerUid: user.uid,
      createdAt: this.now(),
      updatedAt: this.now(),
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
        name: query.windowName,
        queryVersion: query.version,
        content: query,
        collectionId: collectionServerId,
        ownerUid: (await this.mustGetUser()).uid,
        createdAt: this.now(),
        updatedAt: this.now(),
      });

      queryRes.push(res.id);
    }

    return queryRes;
  }

  async updateQuery(queryServerId: string, query: IQuery) {
    await updateDocument(doc(queriesRef(), queryServerId), {
      name: query.windowName,
      queryVersion: query.version,
      content: query,
    });
  }

  async deleteQuery(queryServerId: string) {
    await deleteDoc(doc(queriesRef(), queryServerId));
  }

  async updateCollection(
    collectionServerId: string,
    collection: IQueryCollection,
    parentCollectionServerId?: string
  ) {
    await updateDocument(doc(queryCollectionsRef(), collectionServerId), {
      collectionName: collection.title,
      parentCollectionId: parentCollectionServerId,
    });
  }

  async deleteCollection(collectionServerId: string) {
    await deleteDoc(doc(queryCollectionsRef(), collectionServerId));
  }

  // TODO: Handle team collections
  async getCollections() {
    const user = await this.mustGetUser();
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
        return sn.docs.map((_) => ({ ..._.data(), id: _.id }));
      })
    );

    return queryCollections.map((col, idx) => {
      const queriesResult = collectionQueries[idx];
      return {
        id: col.id,
        ...col.data(),
        queries:
          queriesResult.status === 'fulfilled' ? queriesResult.value : [],
      };
    });
  }
}
