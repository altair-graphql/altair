// Manual mock for electron-store.
// Placed at <root>/__mocks__/electron-store.ts so Vitest uses this
// automatically when vi.mock('electron-store') is called, without ever
// loading the real electron-store package (which requires the Electron
// binary at the top level and fails in CI).
import { vi } from 'vitest';

const ElectronStore = vi.fn().mockImplementation(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  has: vi.fn(),
  store: {},
}));

export default ElectronStore;
