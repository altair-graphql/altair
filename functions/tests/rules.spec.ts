import path from 'path';
import fs from 'fs';
import http from 'http';
import {
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { expect } from '@jest/globals';
import {
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  doc,
  collection,
  setLogLevel,
} from 'firebase/firestore';
import firebaseJson from '../../firebase.json';
import {
  createUtilsContext,
  createQueries,
  collectionNames,
  getQuery,
  createQueryCollection,
} from 'altair-firebase-utils';

// Setup
// - create at least 2 users
// - use actual methods used in the application

// Tests
// - create query, collection
// - update query, collection
// - listen for user doc changes
describe('firestore rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    // setLogLevel('error');

    testEnv = await initializeTestEnvironment({
      projectId: 'demo-test',
      firestore: {
        host: '127.0.0.1',
        port: firebaseJson.emulators.firestore.port,
        rules: fs.readFileSync(path.resolve('..', 'firestore.rules'), 'utf8'),
      },
    });
  });

  afterAll(async () => {
    // Delete all the FirebaseApp instances created during testing.
    // Note: this does not affect or clear any data.
    await testEnv.cleanup();

    // Write the coverage report to a file
    const coverageFile = 'firestore-coverage.html';
    const fstream = fs.createWriteStream(coverageFile);
    const firestoreConfig = testEnv.emulators.firestore;
    if (!firestoreConfig) {
      return;
    }
    const quotedHost = firestoreConfig.host.includes(':')
      ? `[${firestoreConfig.host}]`
      : firestoreConfig.host;

    const ruleCoverageUrlJson = `http://${quotedHost}:${firestoreConfig.port}/emulator/v1/projects/${testEnv.projectId}:ruleCoverage`;
    const ruleCoverageUrl = `${ruleCoverageUrlJson}.html`;
    await new Promise((resolve, reject) => {
      http.get(ruleCoverageUrl, (res) => {
        res.pipe(fstream, { end: true });

        res.on('end', resolve);
        res.on('error', reject);
      });
    });

    console.log(
      `View firestore rule coverage information at ${coverageFile}\n${ruleCoverageUrlJson}\n${ruleCoverageUrl}`
    );
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();

    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const queries = await getDocs(
        collection(ctx.firestore(), `/${collectionNames.queries}`)
      );
      expect(queries.size).toBe(0);
    });

    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const queries = await getDocs(
        collection(ctx.firestore(), `/${collectionNames.queryCollections}`)
      );
      expect(queries.size).toBe(0);
    });

    // setup firestore
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), `/plan_configs/free`), {
        max_query_count: 100,
      });
    });
  });

  const setupUser = async (uid: string) => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), `/users/${uid}`), {
        name: uid,
        email: `${uid}@test.com`,
      });
    });
    const testCtx = testEnv.authenticatedContext(uid, {
      email_verified: true,
      // stripeRole: 'free',
    });

    return { testCtx, user: { uid } };
  };

  describe('query', () => {
    it('owner can read it', async () => {
      // setup authenticated test user
      const { user, testCtx } = await setupUser('alice');
      const db = testCtx.firestore();
      // TODO: Figure out the typing
      const ctx = createUtilsContext(user as any, db as any);
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), '/queries/query_1'), {
          ownerUid: 'alice',
        });
      });

      await assertSucceeds(getQuery(ctx, 'query_1'));
    });

    it('user can create query', async () => {
      const { user, testCtx } = await setupUser('alice');
      const db = testCtx.firestore();
      // TODO: Figure out the typing
      const ctx = createUtilsContext(user as any, db as any);

      const collectionServerId = '1234';
      await assertSucceeds(
        createQueries(ctx, collectionServerId, [
          {
            version: 1,
            apiUrl: '',
            headers: [],
            query: '',
            subscriptionUrl: '',
            type: 'window',
            variables: '',
            windowName: '',
          },
        ])
      );

      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const queries = await getDocs(
          collection(ctx.firestore(), `/${collectionNames.queries}`)
        );
        expect(queries.size).toBe(1);
      });
    });
  });

  describe('query collection', () => {
    it('user can create query collection', async () => {
      const { user, testCtx } = await setupUser('alice');
      const db = testCtx.firestore();
      // TODO: Figure out the typing
      const ctx = createUtilsContext(user as any, db as any);

      await assertSucceeds(
        createQueryCollection(
          ctx,
          {
            queries: [],
            title: 'Collection 1',
          },
          ''
        )
      );

      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const queries = await getDocs(
          collection(ctx.firestore(), `/${collectionNames.queryCollections}`)
        );
        expect(queries.size).toBe(1);
      });
    });
  });
});
