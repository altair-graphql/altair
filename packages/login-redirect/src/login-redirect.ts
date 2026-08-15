import { OAUTH_POPUP_CALLBACK_MESSAGE_TYPE } from '@altairgraphql/api-utils/build/constants';
import { closeWindow, getValidSource, isValidOpener } from './helpers';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import {
  IdentityProvider,
  IDENTITY_PROVIDERS,
} from 'altair-graphql-core/build/identity/providers';

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
  const handoffCode = params.get('handoff_code');
  if (!handoffCode) {
    return;
  }

  return {
    handoffCode,
  };
};

const getProvider = () => {
  const params = new URLSearchParams(window.location.search);
  return (params.get('provider') as IdentityProvider) || IDENTITY_PROVIDERS.GOOGLE;
};

const signInWithRedirect = (apiBaseUrl: string, provider: IdentityProvider) => {
  const state = location.href;
  const loginUrl = new URL(`/auth/${provider.toLowerCase()}/login`, apiBaseUrl);
  loginUrl.searchParams.append('state', state);

  return location.replace(loginUrl.href);
};

const redeemHandoffCode = async (apiBaseUrl: string, handoffCode: string) => {
  const response = await fetch(new URL('/auth/exchange', apiBaseUrl), {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ handoffCode }),
  });
  if (!response.ok) {
    throw new Error('Could not redeem OAuth handoff code');
  }

  const result = (await response.json()) as {
    tokens?: { accessToken?: string };
  };
  if (!result.tokens?.accessToken) {
    throw new Error('OAuth handoff did not return an access token');
  }

  return result.tokens.accessToken;
};

export const initLoginRedirect = async () => {
  const urlConfig = getAltairConfig().getUrlConfig(
    import.meta.env.DEV ? 'development' : 'production'
  );

  const result = getRedirectResult();
  if (!result) {
    const nonce = getNonce();
    if (!nonce) {
      throw new Error('No nonce found!');
    }

    sessionStorage.setItem(OAUTH_NONCE_KEY, nonce);

    const provider = getProvider();
    return signInWithRedirect(urlConfig.api, provider);
  }

  const sanitizedUrl = new URL(location.href);
  sanitizedUrl.searchParams.delete('handoff_code');
  history.replaceState(
    null,
    '',
    `${sanitizedUrl.pathname}${sanitizedUrl.search}${sanitizedUrl.hash}`
  );
  const accessToken = await redeemHandoffCode(urlConfig.api, result.handoffCode);
  await sendToken(accessToken);

  cleanup();
  document.body.innerText = 'You can now close this window.';

  closeWindow();
};
