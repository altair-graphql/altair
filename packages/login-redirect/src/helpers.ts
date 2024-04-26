import { validOrigins } from 'altair-graphql-core/build/origins';

export const closeWindow = () => {
  try {
    console.log('Closing window');
    cleanupSessionStorage();
    window.close();
  } catch {
    // ignore
  }
};
export const cleanupSessionStorage = () => {
  // delete all items from session storage
  sessionStorage.clear();
};
export const getValidSource = () => {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('sc');

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

export const isValidOpener = (opener: unknown): opener is Window => !!opener;

export const sendMessage = (message: unknown, targetOrigin?: string) => {
  // console.log('Sending message', message);
  const openerOrigin = targetOrigin ?? getValidSource();
  if (!openerOrigin) {
    throw new Error('No opener found');
  }

  return (window.opener as Window).postMessage(message, openerOrigin);
};

export const onMessage = (callback: (event: MessageEvent) => void) => {
  window.addEventListener('message', (event) => {
    // console.log('Received message', event);
    if (!isValidOpener(window.opener)) {
      return;
    }

    if (!validOrigins.map((o) => new URL(o).origin).includes(event.origin)) {
      return;
    }

    callback(event);
  });
};
