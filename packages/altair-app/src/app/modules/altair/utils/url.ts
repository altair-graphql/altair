import { debug } from './logger';

export const consumeQueryParam = (key: string) => {
  try {
    const u = new URL(window.location.href);
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
