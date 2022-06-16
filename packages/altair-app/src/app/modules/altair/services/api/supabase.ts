import {
  createClient,
  Provider,
  User,
  UserCredentials,
} from '@supabase/supabase-js';
import { environment } from 'environments/environment';

export const supabase = createClient(
  environment.supabase.publicUrl,
  environment.supabase.apiKey,
  {
    // TODO: Find alternative to storing token in localStorage
    // TODO: Perhaps using https://github.com/auth0/auth0-spa-js/blob/d21736f10ba79f354e9aec52e0d5c6562a3ef049/src/utils.ts#L35
    persistSession: false,
  }
);

export const signinWithPopup = async (
  provider: Provider,
  options?: { redirectTo?: string; scopes?: string }
) => {
  const url = supabase.auth.api.getUrlForProvider(provider, options || {});

  // MUST open popup before any async action is executed, else would be blocked by some browsers
  const popup = openPopup(url);

  if (!popup) {
    throw new Error('Cannot create window!');
  }

  const result = await runPopup(popup);

  return supabase.auth.setSession(result.refresh_token);
};

export const openPopup = (url: string) => {
  const width = 400;
  const height = 600;
  const left = window.screenX + (window.innerWidth - width) / 2;
  const top = window.screenY + (window.innerHeight - height) / 2;

  return window.open(
    url,
    'supabase:authorize:popup',
    `left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,toolbar=no,menubar=no,status=1`
  );
};

const tryGetPopupHash = (popup: Window) => {
  try {
    return popup.location.hash;
  } catch (err) {
    return undefined;
  }
};

const parseURLHash = (urlHash: string) => {
  return urlHash
    .replace(/^\#/, '')
    .split('&')
    .map((_) => _.split('='))
    .reduce(
      (acc, cur) => ({ ...acc, [cur[0]]: cur[1] }),
      <Record<string, string>>{}
    );
};

export const runPopup = (popup: Window) => {
  return new Promise<any>((resolve, reject) => {
    let popupEventListener: EventListenerOrEventListenerObject;
    let onFinish: any;

    // Check each second if the popup is closed triggering a PopupCancelledError
    const popupTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupTimer);
        clearTimeout(timeoutId);
        window.removeEventListener('message', popupEventListener, false);
        return reject(new Error('The popup was closed!'));
      }

      // TODO: Replace with postMessage from hosted page instead
      // e.g. https://github.com/auth0/auth0-spa-js/blob/d21736f10ba79f354e9aec52e0d5c6562a3ef049/src/utils.ts#L122-L137
      // https://dev.to/dinkydani21/how-we-use-a-popup-for-google-and-outlook-oauth-oci
      const currentHash = tryGetPopupHash(popup);
      if (!currentHash) {
        return;
      }
      const hashData = parseURLHash(currentHash);
      if (hashData.access_token) {
        onFinish(currentHash);
      }
    }, 500);

    const timeoutId = setTimeout(() => {
      clearInterval(popupTimer);
      reject(new Error('The popup timed out!'));
      window.removeEventListener('message', popupEventListener, false);
    }, 60 * 1000);

    onFinish = (urlHash: string) => {
      clearTimeout(timeoutId);
      clearInterval(popupTimer);
      popup.close();

      resolve(parseURLHash(urlHash));
    };
    popupEventListener = function (e: MessageEvent) {
      if (!e.data || e.data.type !== 'authorization_response') {
        return;
      }

      window.removeEventListener('message', popupEventListener, false);

      if (e.data.response.error) {
        return reject(new Error(e.data.response.error));
      }

      onFinish(e.data.response);
    };

    window.addEventListener('message', popupEventListener);
  });
};
