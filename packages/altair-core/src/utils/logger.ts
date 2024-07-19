import loglevel from 'loglevel';
import prefix from 'loglevel-plugin-prefix';

export interface ILogger {
  log(...args: any[]): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

prefix.reg(loglevel);
export const createLogger = (environment: {
  production: boolean;
  version: string;
}): ILogger => {
  if (!environment.production) {
    loglevel.setLevel('TRACE');
  } else {
    loglevel.setLevel('ERROR');
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
      } else {
        loglevel.setLevel('ERROR');
      }
      (window as any)._ALTAIR__ENABLE_DEBUG_MODE__ = value;
    },
  });

  return loglevel;
};
