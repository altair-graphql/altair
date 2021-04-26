import { expect } from '@jest/globals';
import {
  _setValueInPath,
  prepareValueToStore,
  _normalizeToResolvedKeyPartsValuePairs,
  normalizeToKeyValue,
} from './async-storage-sync';

describe('async-storage-sync', () => {
  describe('_setValueInPath', () => {
    it('should return a new cloned object and not the original', () => {
      const obj = {
        win: {
          dows: {
            b: 1,
          }
        }
      };
      const res = _setValueInPath('win.dows.b', obj, 2);

      expect(res).not.toBe(obj);
    });

    it('should set value given object path parts', () => {
      const obj = {
        win: {
          dows: {
            b: 1,
          }
        }
      };
      const res = _setValueInPath('win.dows.b', obj, 2);

      expect(obj).toStrictEqual({
        win: {
          dows: {
            b: 1,
          }
        }
      });

      expect(res).toStrictEqual({
        win: {
          dows: {
            b: 2,
          }
        }
      });
    });

    it('should not set value if path not exists', () => {
      const obj = {
        win: {
          dows: {
            b: 1,
          }
        }
      };
      const res = _setValueInPath('win.dows.notfound', obj, 2);

      expect(res).toStrictEqual({
        win: {
          dows: {
            b: 1,
          }
        }
      });
    });

    it('should not set value if path in-between does not exist', () => {
      const obj = {
        win: {
          dows: {
            b: 1,
          }
        }
      };
      const res = _setValueInPath('win.notfound.b', obj, 2);

      expect(res).toStrictEqual({
        win: {
          dows: {
            b: 1,
          }
        }
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
          }
        }
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
          }
        }
      });
    });
  });

  describe('prepareValueToStore', () => {
    it('returns new cloned object', () => {
      const data = {
        x: {
          y: 1
        }
      };
      const res = prepareValueToStore('namespace::somekey::somekey2', data);
      expect(res).not.toBe(data);
    })

    it('returns same data if no purge path in key path', () => {
      const data = {
        x: {
          y: 1
        }
      };
      const res = prepareValueToStore('namespace::somekey::somekey2', data);
      expect(res).toEqual({
        x: {
          y: 1,
        }
      });
    })

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
    })

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
      const res = prepareValueToStore('namespace::windows::some-window-id::schema', window);
      expect(res).toEqual({
        layout: {
          title: 'Test',
        },
        query: {
          query: '{ hello }',
        },
        schema: { schema: {} },
      });
    })
  });

  describe('_normalizeToResolvedKeyValue', () => {
    it('should return array of keyParts-value pairs for given path parts', () => {
      const obj = {
        win: {
          doms: {
            b: 1,
          }
        }
      };
      const res = _normalizeToResolvedKeyPartsValuePairs('win.doms.b'.split('.'), obj);
      expect(res).toEqual([{
        keyParts: [ 'win', 'doms', 'b' ],
        value: 1,
      }]);
    })

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
        }
      };
      const res = _normalizeToResolvedKeyPartsValuePairs('win.$$.b'.split('.'), obj);
      expect(res).toEqual([
        {
          keyParts: [ 'win', 'doms', 'b' ],
          value: 1,
        },
        {
          keyParts: [ 'win', 'mods', 'b' ],
          value: 2,
        },
        {
          keyParts: [ 'win', 'sodm', 'b' ],
          value: 3,
        },
      ]);
    })
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
      const normalized = normalizeToKeyValue(state as any, ['environments', 'settings', 'windows'], 'altair');
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
      const normalized = normalizeToKeyValue(state as any, ['environments', 'settings', 'windows'], 'altair');
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
});
