import { initializeClient } from '@altairgraphql/api-utils';
import { OAUTH_POPUP_CALLBACK_MESSAGE_TYPE } from '@altairgraphql/api-utils/build/constants';
import { closeWindow, getValidSource, isValidOpener } from './helpers';

const OAUTH_NONCE_KEY = 'altairgql:oauth:nonce:key';

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

const getRedirectResult = () => {
  const params = new URLSearchParams(location.search);
  const accessToken = params.get('access_token');
  if (!accessToken) {
    return;
  }

  return {
    accessToken,
  };
};

const signInWithRedirect = (apiBaseUrl: string) => {
  const state = location.href;
  const loginUrl = new URL('/auth/google/login', apiBaseUrl);
  loginUrl.searchParams.append('state', state);

  return location.replace(loginUrl.href);
};

export const initLoginRedirect = async () => {
  const client = initializeClient(
    import.meta.env.DEV ? 'development' : 'production'
  );

  const result = getRedirectResult();
  if (!result) {
    const nonce = getNonce();
    if (!nonce) {
      throw new Error('No nonce found!');
    }

    sessionStorage.setItem(OAUTH_NONCE_KEY, nonce);

    return signInWithRedirect(client.options.apiBaseUrl);
  }

  await sendToken(result.accessToken);

  cleanup();
  document.body.innerText = 'You can now close this window.';

  closeWindow();
};
