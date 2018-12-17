import { environment } from 'environments/environment';


/**
 * Only logs in development or when __ENABLE_DEBUG_MODE__ flag is true
 */
const debug = {
  log: (...args) => console.log(args)
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
