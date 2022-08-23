import * as functions from 'firebase-functions';
import { auth } from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// https://stackoverflow.com/questions/51656107/managing-createdat-timestamp-in-firestore
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

// add middleware to authenticate requests
// app.use(authMiddleware);

// Create custom token for uid
app.post('/token', async (req, res) => {
  const body = req.body;

  const idToken = body?.id_token;

  if (!idToken) {
    return res
      .status(400)
      .send({ status: 'error', message: 'invalid arguments' });
  }

  const decodedToken = await auth().verifyIdToken(idToken);

  const uid = decodedToken.uid;

  const authToken = await auth().createCustomToken(uid);

  return res.send({ status: 'success', auth_token: authToken });
});

export const api = functions.https.onRequest(app);
