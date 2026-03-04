import { INIT } from '@ngrx/store';
import {
  _setValueInPath,
  prepareValueToStore,
  _normalizeToResolvedKeyPartsValuePairs,
  normalizeToKeyValue,
  defaultMergeReducer,
  asyncStorageSync,
} from './async-storage-sync';
import { APP_INIT_ACTION } from './action';

describe('async-storage-sync', () => {
  describe('_setValueInPath', () => {
    it('should return a new cloned object and not the original', () => {
      const obj = {
        win: {
          dows: {
            b: 1,
          },
        },
      };
      const res = _setValueInPath('win.dows.b', obj, 2);

      expect(res).not.toBe(obj);
    });

    it('should set value given object path parts', () => {
      const obj = {
        win: {
          dows: {
            b: 1,
          },
        },
      };
      const res = _setValueInPath('win.dows.b', obj, 2);

      expect(obj).toStrictEqual({
        win: {
          dows: {
            b: 1,
          },
        },
      });

      expect(res).toStrictEqual({
        win: {
          dows: {
            b: 2,
          },
        },
      });
    });

    it('should not set value if path not exists', () => {
      const obj = {
        win: {
          dows: {
            b: 1,
          },
        },
      };
      const res = _setValueInPath('win.dows.notfound', obj, 2);

      expect(res).toStrictEqual({
        win: {
          dows: {
            b: 1,
          },
        },
      });
    });

    it('should not set value if path in-between does not exist', () => {
      const obj = {
        win: {
          dows: {
            b: 1,
          },
        },
      };
      const res = _setValueInPath('win.notfound.b', obj, 2);

      expect(res).toStrictEqual({
        win: {
          dows: {
            b: 1,
          },
        },
      });
    });

    it('should set value to all object key paths if path parts includes "$$"', () => {
      const obj = {
        win: {
          dows: {
            b: 1,
          },
          swod: {
            b: 2,
          },
          wods: {
            b: 3,
          },
        },
      };
      const res = _setValueInPath('win.$$.b', obj, 'set');

      expect(res).toStrictEqual({
        win: {
          dows: {
            b: 'set',
          },
          swod: {
            b: 'set',
          },
          wods: {
            b: 'set',
          },
        },
      });
    });
  });

  describe('prepareValueToStore', () => {
    it('returns new cloned object', () => {
      const data = {
        x: {
          y: 1,
        },
      };
      const res = prepareValueToStore('namespace::somekey::somekey2', data);
      expect(res).not.toBe(data);
    });

    it('returns same data if no purge path in key path', () => {
      const data = {
        x: {
          y: 1,
        },
      };
      const res = prepareValueToStore('namespace::somekey::somekey2', data);
      expect(res).toEqual({
        x: {
          y: 1,
        },
      });
    });

    it('returns data with purged content if purge path in key path', () => {
      const window = {
        layout: {
          title: 'Test',
        },
        query: {
          query: '{ hello }',
        },
        schema: { schema: {} },
      };
      const res = prepareValueToStore('namespace::windows::some-window-id', window);
      expect(res).toEqual({
        layout: {
          title: 'Test',
        },
        query: {
          query: '{ hello }',
        },
        schema: undefined,
      });
    });

    it('should not purge content if key path matches purge path exactly', () => {
      const window = {
        layout: {
          title: 'Test',
        },
        query: {
          query: '{ hello }',
        },
        schema: { schema: {} },
      };
      const res = prepareValueToStore(
        'namespace::windows::some-window-id::schema',
        window
      );
      expect(res).toEqual({
        layout: {
          title: 'Test',
        },
        query: {
          query: '{ hello }',
        },
        schema: { schema: {} },
      });
    });
  });

  describe('_normalizeToResolvedKeyValue', () => {
    it('should return array of keyParts-value pairs for given path parts', () => {
      const obj = {
        win: {
          doms: {
            b: 1,
          },
        },
      };
      const res = _normalizeToResolvedKeyPartsValuePairs(
        'win.doms.b'.split('.'),
        obj
      );
      expect(res).toEqual([
        {
          keyParts: ['win', 'doms', 'b'],
          value: 1,
        },
      ]);
    });

    it('should return array of keyParts-value pairs for given path parts', () => {
      const obj = {
        win: {
          doms: {
            b: 1,
          },
          mods: {
            b: 2,
          },
          sodm: {
            b: 3,
          },
        },
      };
      const res = _normalizeToResolvedKeyPartsValuePairs('win.$$.b'.split('.'), obj);
      expect(res).toEqual([
        {
          keyParts: ['win', 'doms', 'b'],
          value: 1,
        },
        {
          keyParts: ['win', 'mods', 'b'],
          value: 2,
        },
        {
          keyParts: ['win', 'sodm', 'b'],
          value: 3,
        },
      ]);
    });
  });

  describe('normalizeToKeyValue', () => {
    it('should return normalized object for non-special cases', () => {
      const state = {
        environments: {
          somestate: {
            inner: 1,
          },
        },
        settings: {
          setstate: {
            innersetstate: 2,
          },
        },
      };
      const normalized = normalizeToKeyValue(
        state as any,
        ['environments', 'settings', 'windows'],
        'altair'
      );
      expect(normalized).toEqual({
        '[altair]::environments': {
          somestate: {
            inner: 1,
          },
        },
        '[altair]::settings': {
          setstate: {
            innersetstate: 2,
          },
        },
      });
    });
    it('should return normalized object for special cases', () => {
      const state = {
        environments: {
          somestate: {
            inner: 1,
          },
        },
        windows: {
          '123-456-789': {
            query: {
              query: 'Test',
            },
            schema: {
              schema: 'for 123-456-789',
            },
          },
          '987-654-321': {
            query: {
              query: '{ hello }',
            },
            schema: {
              schema: 'for 987-654-321',
            },
          },
        },
      };
      const normalized = normalizeToKeyValue(
        state as any,
        ['environments', 'settings', 'windows'],
        'altair'
      );
      expect(normalized).toEqual({
        '[altair]::environments': {
          somestate: {
            inner: 1,
          },
        },
        '[altair]::windows::123-456-789': {
          query: {
            query: 'Test',
          },
          schema: {
            schema: 'for 123-456-789',
          },
        },
        '[altair]::windows::987-654-321': {
          query: {
            query: '{ hello }',
          },
          schema: {
            schema: 'for 987-654-321',
          },
        },
        '[altair]::windows::123-456-789::schema': {
          schema: 'for 123-456-789',
        },
        '[altair]::windows::987-654-321::schema': {
          schema: 'for 987-654-321',
        },
      });
    });
  });

  describe('defaultMergeReducer', () => {
    it('should return state as-is if action is not APP_INIT_ACTION', () => {
      const state = { a: 1 };
      const rehydrated = { b: 2 };
      const result = defaultMergeReducer(state, rehydrated, { type: 'OTHER' });
      expect(result).toBe(state);
    });

    it('should return state as-is if no rehydratedState', () => {
      const state = { a: 1 };
      const result = defaultMergeReducer(state, null, { type: APP_INIT_ACTION });
      expect(result).toEqual({ a: 1 });
    });

    it('should deep merge state with rehydratedState on APP_INIT_ACTION', () => {
      const state = { a: 1, nested: { x: 10 } };
      const rehydrated = { b: 2, nested: { y: 20 } };
      const result = defaultMergeReducer(state, rehydrated, {
        type: APP_INIT_ACTION,
      });
      expect(result).toEqual({ a: 1, b: 2, nested: { x: 10, y: 20 } });
    });

    it('should overwrite arrays from rehydrated state', () => {
      const state = { items: [1, 2, 3] };
      const rehydrated = { items: [4, 5] };
      const result = defaultMergeReducer(state, rehydrated, {
        type: APP_INIT_ACTION,
      });
      expect(result.items).toEqual([4, 5]);
    });
  });

  describe('asyncStorageSync', () => {
    const mockReducer = (state: any = { count: 0 }, action: any) => {
      if (action.type === 'INCREMENT') {
        return { ...state, count: state.count + 1 };
      }
      return state;
    };

    it('should pass action through to the underlying reducer', () => {
      const metaReducer = asyncStorageSync({ keys: [] as any });
      const reducer = metaReducer(mockReducer);
      const nextState = reducer({ count: 0 }, { type: 'INCREMENT' } as any);
      expect(nextState.count).toBe(1);
    });

    it('should handle INIT action with no state by calling reducer', () => {
      const metaReducer = asyncStorageSync({ keys: [] as any });
      const reducer = metaReducer(mockReducer);
      const nextState = reducer(undefined, { type: INIT } as any);
      expect(nextState).toEqual({ count: 0 });
    });
  });
});
