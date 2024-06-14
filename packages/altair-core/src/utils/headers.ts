import { HeaderState } from '../types/state/header.interfaces';

export const headerListToMap = (headers: HeaderState): Record<string, unknown> => {
  return headers.reduce(
    (res, cur) => {
      if (cur.key && cur.value && cur.enabled) {
        res[cur.key] = cur.value;
      }

      return res;
    },
    {} as Record<string, unknown>
  );
};

export const headerMapToList = (headers: Record<string, unknown>): HeaderState => {
  return Object.keys(headers).map((key) => ({
    key,
    value: headers[key] ? '' + headers[key] : '',
    enabled: true,
  }));
};
