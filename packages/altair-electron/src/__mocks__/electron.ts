// Stub for the `electron` module used during unit tests.
// electron-store imports electron unconditionally at the top level, which
// triggers Electron's binary check and fails in CI environments where the
// binary is not installed. This stub satisfies those imports without
// requiring the real Electron binary.
export const app = {
  getPath: () => '/tmp',
  getVersion: () => '0.0.0',
  getName: () => 'altair',
};
export const ipcMain = { on: () => {}, handle: () => {} };
export const ipcRenderer = { on: () => {}, send: () => {} };
export const shell = { openExternal: () => {} };
