import loglevel from 'loglevel';
import prefix from 'loglevel-plugin-prefix';

prefix.reg(loglevel);
export const createLogger = (environment: { production: boolean, version: string }) => {

  if (!environment.production) {
    loglevel.setLevel('TRACE');
  }
  
  const PREVIOUS_VERSION_KEY = 'altair__debug_previous_version';
  const CURRENT_VERSION_KEY = 'altair__debug_current_version';
  const previousVersion = () => localStorage.getItem(PREVIOUS_VERSION_KEY);
  const currentVersion = () => localStorage.getItem(CURRENT_VERSION_KEY);
  
  if (currentVersion() && currentVersion() !== environment.version) {
    // New app version
    // prev = current
    // current = env.version
    localStorage.setItem(PREVIOUS_VERSION_KEY, currentVersion()!);
    localStorage.setItem(CURRENT_VERSION_KEY, environment.version);
  } else {
    localStorage.setItem(CURRENT_VERSION_KEY, currentVersion()!);
  }
  
  Object.defineProperty(window, '__ENABLE_DEBUG_MODE__', {
    get() {
      return (window as any)._ALTAIR__ENABLE_DEBUG_MODE__;
    },
    set(value) {
      if (value) {
        // Display debug information.
        console.group('⚙️🛠Altair Debug Information');
        console.log('Previous version:', previousVersion());
        console.log('Current version:', currentVersion());
        console.groupEnd();
        loglevel.setLevel('TRACE');
      }
      (window as any)._ALTAIR__ENABLE_DEBUG_MODE__ = value;
    }
  });

  return loglevel;
};
