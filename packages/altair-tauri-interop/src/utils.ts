// Check if we're running in a Tauri environment
export const isTauriApp = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

// Get the Tauri API if available
export const getTauriAPI = () => {
  if (isTauriApp()) {
    return (window as any).__TAURI__;
  }
  return null;
};