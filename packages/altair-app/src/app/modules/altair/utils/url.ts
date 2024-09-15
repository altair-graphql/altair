import { debug } from './logger';

export const consumeQueryParam = (key: string, url = window.location.href) => {
  try {
    const u = new URL(url);
    const value = u.searchParams.get(key);
    if (!value) {
      return;
    }
    u.searchParams.delete(key);
    window.history.replaceState({}, '', u.href);
    return value;
  } catch (e) {
    debug.error('Error consuming query param', e);
  }
};
