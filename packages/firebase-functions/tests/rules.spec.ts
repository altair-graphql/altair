import path from 'path';
import fs from 'fs';
import http from 'http';
import {
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestContext,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { expect } from '@jest/globals';
import {
  getDocs,
  setDoc,
  doc,
  collection,
  Firestore,
} from 'firebase/firestore';
import firebaseJson from '../../../firebase.json';
import {
  createQueries,
  collectionNames,
  getQuery,
  createQueryCollection,
  getTeams,
  getFirestoreSettings,
  FirebaseUtilsContext,
  updateQuery,
  deleteQuery,
  getCollection,
  updateCollection,
  deleteCollection,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  getTeamMembers,
} from 'altair-firebase-utils';
import { PlanConfig } from 'altair-firebase-utils/build/interfaces';
import { TeamId } from 'altair-graphql-core/build/cjs/types/state/account.interfaces';

const getFirestore = (ctx: RulesTestContext) =>
  ctx.firestore({ ...getFirestoreSettings(), merge: true });

const createUtilsContext = (
  uid: string,
  db: firebase.default.firestore.Firestore
): FirebaseUtilsContext => ({
  uid,
  db: db as unknown as Firestore,
});

// Setup
// - create at least 2 users
// - use actual methods used in the application

// Tests
// - create query, collection
// - update query, collection
// - listen for user doc changes
// - check count limits
describe('firestore rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    // setLogLevel('error');

    testEnv = await initializeTestEnvironment({
      projectId: 'demo-test',
      firestore: {
        host: '127.0.0.1',
        port: firebaseJson.emulators.firestore.port,
        rules: fs.readFileSync(
          path.resolve(__dirname, '../../..', 'firestore.rules'),
          'utf8'
        ),
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
        collection(getFirestore(ctx), `/${collectionNames.queries}`)
      );
      expect(queries.size).toBe(0);
    });

    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const queries = await getDocs(
        collection(getFirestore(ctx), `/${collectionNames.queryCollections}`)
      );
      expect(queries.size).toBe(0);
    });

    // setup firestore
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      // setup plan config
      await setDoc(doc(getFirestore(ctx), `/plan_configs/free`), <PlanConfig>{
        max_query_count: 100,
        max_team_count: 1,
        max_team_member_count: 2,
      });
    });
  });

  const setupUser = async (uid: string) => {
    const email = `${uid}@test.com`;
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(getFirestore(ctx), `/users/${uid}`), {
        name: uid,
        email,
      });
    });
    const testCtx = testEnv.authenticatedContext(uid, {
      email_verified: true,
      // stripeRole: 'free',
    });

    return { testCtx, user: { uid, email } };
  };

  describe('query', () => {
    it('owner can read it', async () => {
      // setup authenticated test user
      const { user, testCtx } = await setupUser('alice');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(getFirestore(ctx), '/queries/query_1'), {
          ownerUid: 'alice',
        });
      });

      await assertSucceeds(getQuery(ctx, 'query_1'));
    });

    it('user can create query', async () => {
      const { user, testCtx } = await setupUser('alice');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);

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
          collection(getFirestore(ctx), `/${collectionNames.queries}`)
        );
        expect(queries.size).toBe(1);
      });
    });

    it('user can update query', async () => {
      const { user, testCtx } = await setupUser('alice');

      const ctx = createUtilsContext(user.uid, getFirestore(testCtx));
      const collectionServerId = '1234';
      const [queryId] = await createQueries(ctx, collectionServerId, [
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
      ]);

      assertSucceeds(
        updateQuery(ctx, queryId, {
          version: 1,
          apiUrl: 'https://newurl.com/graphql',
          headers: [],
          query: '',
          subscriptionUrl: '',
          type: 'window',
          variables: '',
          windowName: 'Updated query',
        })
      );

      const query = await getQuery(ctx, queryId);
      expect(query?.apiUrl).toBe('https://newurl.com/graphql');
      expect(query?.windowName).toBe('Updated query');
    });

    it('user can delete query', async () => {
      const { user, testCtx } = await setupUser('alice');

      const ctx = createUtilsContext(user.uid, getFirestore(testCtx));
      const collectionServerId = '1234';
      const [queryId] = await createQueries(ctx, collectionServerId, [
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
      ]);

      assertSucceeds(deleteQuery(ctx, queryId));

      const query = await getQuery(ctx, queryId);
      expect(query).toBeUndefined();
    });
  });

  describe('query collection', () => {
    it('user can create and read query collection', async () => {
      const { user, testCtx } = await setupUser('alice');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);

      const { collectionId } = await assertSucceeds(
        createQueryCollection(
          ctx,
          {
            queries: [],
            title: 'Collection 1',
          },
          ''
        )
      );

      const collection = await assertSucceeds(getCollection(ctx, collectionId));

      expect(collection).not.toBeUndefined();
      expect(collection?.title).toBe('Collection 1');
    });

    it('user can update query collection', async () => {
      const { user, testCtx } = await setupUser('alice');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);

      const { collectionId } = await assertSucceeds(
        createQueryCollection(
          ctx,
          {
            queries: [],
            title: 'Collection 1',
          },
          ''
        )
      );

      await assertSucceeds(
        updateCollection(ctx, collectionId, {
          id: collectionId,
          title: 'Updated collection 1',
          description: 'Updated with description',
          queries: [],
        })
      );

      const collection = await assertSucceeds(getCollection(ctx, collectionId));

      expect(collection).not.toBeUndefined();
      expect(collection?.title).toBe('Updated collection 1');
      expect(collection?.description).toBe('Updated with description');
    });

    it('user can delete query collection', async () => {
      const { user, testCtx } = await setupUser('alice');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);

      const { collectionId } = await assertSucceeds(
        createQueryCollection(
          ctx,
          {
            queries: [],
            title: 'Collection 1',
          },
          ''
        )
      );

      await assertSucceeds(deleteCollection(ctx, collectionId));

      const collection = await assertSucceeds(getCollection(ctx, collectionId));

      expect(collection).toBeUndefined();
    });
  });

  describe('team', () => {
    it('owners can get teams', async () => {
      const { user, testCtx } = await setupUser('alice');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);
      await assertSucceeds(getTeams(ctx));
    });

    it('user can create team', async () => {
      const { user, testCtx } = await setupUser('alice');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);

      const teamId = await assertSucceeds(
        createTeam(ctx, {
          name: 'Team 1',
          description: 'Team 1 description',
        })
      );

      const teams = await assertSucceeds(getTeams(ctx));

      expect(teams.length).toBe(1);
      const t = teams[0];

      expect(t).not.toBeUndefined();
      expect(t.id).toBe(teamId);
      expect(t.name).toBe('Team 1');
      expect(t.description).toBe('Team 1 description');
    });

    it('owner can update team', async () => {
      const { user, testCtx } = await setupUser('alice');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);

      const teamId = await assertSucceeds(
        createTeam(ctx, {
          name: 'Team 1',
          description: 'Team 1 description',
        })
      );

      await assertSucceeds(
        updateTeam(ctx, teamId, {
          id: teamId,
          name: 'Updated team name',
        })
      );

      const teams = await assertSucceeds(getTeams(ctx));

      expect(teams.length).toBe(1);
      const t = teams[0];

      expect(t).not.toBeUndefined();
      expect(t.id).toBe(teamId);
      expect(t.name).toBe('Updated team name');
    });

    it('owner can delete team', async () => {
      const { user, testCtx } = await setupUser('alice');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);

      const teamId = await assertSucceeds(
        createTeam(ctx, {
          name: 'Team 1',
          description: 'Team 1 description',
        })
      );

      await assertSucceeds(deleteTeam(ctx, teamId));

      const teams = await assertSucceeds(getTeams(ctx));

      expect(teams.length).toBe(0);
    });

    it('team owners can add team members', async () => {
      const { user, testCtx } = await setupUser('alice');
      const { user: bobUser } = await setupUser('bob');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);
      const teamId = await assertSucceeds(
        createTeam(ctx, {
          name: 'Team 1',
          description: 'Team 1 description',
        })
      );

      await assertSucceeds(
        addTeamMember(ctx, {
          email: bobUser.email,
          role: 'member',
          teamUid: teamId,
        })
      );

      const members = await assertSucceeds(
        getTeamMembers(ctx, new TeamId(teamId))
      );
      expect(members.length).toBe(1);
      expect(members[0].uid).toBe(bobUser.uid);
    });

    it('team admins can add team members', async () => {
      const { user, testCtx } = await setupUser('alice');
      const { user: bobUser, testCtx: bobTestCtx } = await setupUser('bob');
      const { user: chrisUser } = await setupUser('chris');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);
      const teamId = await assertSucceeds(
        createTeam(ctx, {
          name: 'Team 1',
          description: 'Team 1 description',
        })
      );

      await assertSucceeds(
        addTeamMember(ctx, {
          email: bobUser.email,
          role: 'admin',
          teamUid: teamId,
        })
      );

      await assertSucceeds(
        addTeamMember(
          createUtilsContext(bobUser.uid, getFirestore(bobTestCtx)),
          {
            email: chrisUser.email,
            role: 'member',
            teamUid: teamId,
          }
        )
      );

      const members = await assertSucceeds(
        getTeamMembers(ctx, new TeamId(teamId))
      );
      expect(members.length).toBe(2);
      expect(
        members.find((_) => _.email === chrisUser.email)
      ).not.toBeUndefined();
    });

    it('team member can get team members', async () => {
      const { user, testCtx } = await setupUser('alice');
      const { user: bobUser, testCtx: bobTestCtx } = await setupUser('bob');
      const db = getFirestore(testCtx);
      const ctx = createUtilsContext(user.uid, db);
      const teamId = await assertSucceeds(
        createTeam(ctx, {
          name: 'Team 1',
          description: 'Team 1 description',
        })
      );

      await assertSucceeds(
        addTeamMember(ctx, {
          email: bobUser.email,
          role: 'member',
          teamUid: teamId,
        })
      );

      const members = await assertSucceeds(
        getTeamMembers(
          createUtilsContext(bobUser.uid, getFirestore(bobTestCtx)),
          new TeamId(teamId)
        )
      );

      expect(members.length).toBe(1);
    });
  });
});
