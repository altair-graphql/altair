import { normalize } from './index';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';

describe('normalize', () => {
  it('should return an empty object for empty state', () => {
    const result = normalize({} as WindowState);
    expect(result).toEqual({});
  });

  it('should set enabled=true on headers that have no enabled property', () => {
    const state = {
      win1: {
        windowId: 'win1',
        headers: [
          { key: 'Authorization', value: 'Bearer token' },
          { key: 'Content-Type', value: 'application/json', enabled: false },
        ],
      },
    } as unknown as WindowState;

    const result = normalize(state);
    const win1 = result['win1'];
    expect(win1).toBeDefined();
    const headers = win1!.headers!;
    expect(headers[0]!.enabled).toBe(true);
    expect(headers[1]!.enabled).toBe(false);
  });

  it('should preserve enabled=true on headers that already have it', () => {
    const state = {
      win1: {
        windowId: 'win1',
        headers: [{ key: 'X-Key', value: 'val', enabled: true }],
      },
    } as unknown as WindowState;

    const result = normalize(state);
    const win1 = result['win1'];
    expect(win1).toBeDefined();
    expect(win1!.headers![0]!.enabled).toBe(true);
  });

  it('should handle windows with no headers', () => {
    const state = {
      win1: {
        windowId: 'win1',
      },
    } as unknown as WindowState;

    const result = normalize(state);
    const win1 = result['win1'];
    expect(win1).toBeDefined();
    expect(win1!.headers).toBeUndefined();
  });

  it('should skip undefined window states', () => {
    const state = {
      win1: undefined,
      win2: { windowId: 'win2', headers: [] },
    } as unknown as WindowState;

    const result = normalize(state);
    expect(result['win1']).toBeUndefined();
    expect(result['win2']).toBeDefined();
  });

  it('should handle multiple windows', () => {
    const state = {
      win1: { windowId: 'win1', headers: [{ key: 'A', value: '1' }] },
      win2: { windowId: 'win2', headers: [{ key: 'B', value: '2', enabled: false }] },
    } as unknown as WindowState;

    const result = normalize(state);
    expect(result['win1']!.headers![0]!.enabled).toBe(true);
    expect(result['win2']!.headers![0]!.enabled).toBe(false);
  });
});
