import { getClientConfig } from '@altairgraphql/firebase-utils';
import { OAUTH_POPUP_CALLBACK_MESSAGE_TYPE } from '@altairgraphql/firebase-utils/build/constants';
import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  signInWithRedirect,
} from 'firebase/auth';

const validOrigins = [
  'chrome-extension://flnheeellpciglgpaodhkhmapeljopja', // chrome extension
  'chrome-extension://aiopipphfnlndegenpkclffgaiillbdd', // unpacked chrome extension
  'moz-extension://567d7e27-43b8-994e-ab50-e770fa7eab4b', // firefox extension
  'http://localhost:4200', // local altair app
];

const firebaseConfig = getClientConfig();

const firebaseDomain = () =>
  `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net`;

const OAUTH_NONCE_KEY = 'altairgql:oauth:nonce:key';

const init = async () => {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const result = await getRedirectResult(auth);
  if (!result) {
    const nonce = getNonce();
    if (!nonce) {
      throw new Error('No nonce found!');
    }

    sessionStorage.setItem(OAUTH_NONCE_KEY, nonce);

    const provider = new GoogleAuthProvider();
    return signInWithRedirect(auth, provider);
  }

  const token = await result.user.getIdToken();

  const response = await fetch(`${firebaseDomain()}/api/token`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id_token: token }),
  });
  const json = await response.json();
  // console.log(json);

  if (json.status === 'success') {
    await sendToken(json.auth_token);
  }

  cleanup();
  document.body.innerText = 'You can now close this window.';

  closeWindow();
};

const closeWindow = () => {
  try {
    window.close();
  } catch {
    // ignore
  }
};

const getNonce = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('nonce');
};

const cleanup = () => {
  sessionStorage.removeItem(OAUTH_NONCE_KEY);
};

const checkNonce = (nonce?: string | null) => {
  const previous = sessionStorage.getItem(OAUTH_NONCE_KEY);
  if (!previous || !nonce) {
    return false;
  }
  return previous === nonce;
};

const isValidOpener = (opener: unknown): opener is Window => !!opener;

const getValidSource = () => {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');

  if (!source) {
    return;
  }

  // Validate origin
  const url = new URL(source);
  if (!validOrigins.includes(url.origin)) {
    return;
  }

  return url.origin;
};

const sendToken = async (token: string) => {
  const nonce = getNonce();

  if (!checkNonce(nonce)) {
    throw new Error('nonce does not match!');
  }
  const payload = { token, nonce };

  if (isValidOpener(window.opener)) {
    const source = getValidSource();
    if (!source) {
      throw new Error('Invalid source provided!');
    }
    window.opener.postMessage(
      {
        type: OAUTH_POPUP_CALLBACK_MESSAGE_TYPE,
        payload,
      },
      source
    );
    return;
  }
  await fetch('/callback', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

init();
