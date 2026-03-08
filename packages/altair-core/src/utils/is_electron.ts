export default !!(
  (globalThis &&
    (globalThis as any).process &&
    (globalThis as any).process.versions.electron) ||
  !!globalThis?.navigator?.userAgent?.match(/Electron/)
);
