import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';
import { IDictionary } from '../interfaces/shared';

export const headerListToMap = (headers: HeaderState): IDictionary => {
  return headers.reduce((res, cur) => {
    if (cur.enabled) {
      res[cur.key] = cur.value;
    }

    return res;
  }, {} as IDictionary);
};

export const headerMapToList = (headers: IDictionary): HeaderState => {
  return Object.keys(headers).map((key) => ({
    key,
    value: headers[key] ? '' + headers[key] : '',
    enabled: true,
  }));
};
