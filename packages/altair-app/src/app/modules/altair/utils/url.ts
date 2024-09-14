import { debug } from './logger';

export const consumeQueryParam = (key: string) => {
  try {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const value = urlSearchParams.get(key);
    if (!value) {
      return;
    }
    urlSearchParams.delete(key);
    const params = urlSearchParams.toString();
    const newUrl = `${window.location.pathname}${params ? '?' : ''}${params}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
    return value;
  } catch (e) {
    debug.error('Error consuming query param', e);
  }
};
