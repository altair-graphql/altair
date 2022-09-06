import path from 'path';
import fs from 'fs';
import http from 'http';
import {
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  getDoc,
  addDoc,
  setDoc,
  doc,
  collection,
  setLogLevel,
} from 'firebase/firestore';
import firebaseJson from '../../firebase.json';

describe('firestore rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    // setLogLevel('error');

    testEnv = await initializeTestEnvironment({
      projectId: 'demo-test',
      firestore: {
        host: 'localhost',
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
    await new Promise((resolve, reject) => {
      const firestoreConfig = testEnv.emulators.firestore;
      if (!firestoreConfig) {
        return;
      }
      const quotedHost = firestoreConfig.host.includes(':')
        ? `[${firestoreConfig.host}]`
        : firestoreConfig.host;
      http.get(
        `http://${quotedHost}:${firestoreConfig.port}/emulator/v1/projects/${testEnv.projectId}:ruleCoverage.html`,
        (res) => {
          res.pipe(fstream, { end: true });

          res.on('end', resolve);
          res.on('error', reject);
        }
      );
    });

    console.log(
      `View firestore rule coverage information at ${coverageFile}\n`
    );
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();

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
    const userCtx = testEnv.authenticatedContext(uid, {
      email_verified: true,
      // stripeRole: 'free',
    });

    return userCtx;
  };

  describe('query', () => {
    it('owner can read it', async () => {
      // setup authenticated test user
      const user = await setupUser('alice');
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), '/queries/query_1'), {
          ownerUid: 'alice',
        });
      });

      await assertSucceeds(getDoc(doc(user.firestore(), '/queries/query_1')));
    });

    it('user can create query', async () => {
      const user = await setupUser('alice');

      await assertSucceeds(
        addDoc(collection(user.firestore(), 'queries'), {
          ownerUid: 'alice',
        })
      );
    });
  });
});
