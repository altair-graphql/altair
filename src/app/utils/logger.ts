import { environment } from 'environments/environment';

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
}

Object.defineProperty(window, '__ENABLE_DEBUG_MODE__', {
  get() {
    return window['_ALTAIR__ENABLE_DEBUG_MODE__'];
  },
  set(value) {
    if (value) {
      // Display debug information.
      console.group('⚙️🛠Altair Debug Information');
      console.log('Previous version:', previousVersion());
      console.log('Current version:', currentVersion());
      console.groupEnd();
    }
    window['_ALTAIR__ENABLE_DEBUG_MODE__'] = value;
  }
});

/**
 * Only logs in development or when __ENABLE_DEBUG_MODE__ flag is true
 */
const debug = {
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
};

Object.defineProperty(debug, 'log', {
  get() {
    if (!environment.production || window['__ENABLE_DEBUG_MODE__']) {
      return console.log.bind(console);
    }

    return () => {};
  }
});

export { debug };
