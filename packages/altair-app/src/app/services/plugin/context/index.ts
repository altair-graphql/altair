import { debug } from 'app/utils/logger';

/**
 * Context built to be unique to each plugin
 * Should not require updating the context on each state change
 *
 * Create context when creating plugin instance, with plugin meta.
 */
const context = {
  app: {
    /**
     * Returns an allowed set of data from the state visible to plugins
     *
     * Since it is a method, the state can be generated when called.
     * So we can ensure uniqueness of the state, as well as avoid passing values by references.
     */
    getState() {},
  },
  commands: {
    createWindow() {},
    setQuery() {},
    setVariables() {},
    setEndpoint() {},
    isElectron() {},
    /**
     * panel has two locations: sidebar, header
     *
     * Each call creates a new panel. Instead, plugin should create panel only once (@initialize)
     * Panel can be destroyed when the plugin is unused.
     *
     * returns panel instance (includes destroy() method)
     */
    createPanel() {},
    /**
     * action has 1 location for now: resultpane
     *
     * Each call creates a new action. Instead, plugins should create action once, when needed
     * Action can be destroyed when the plugin decides to.
     *
     * returns action instance (includes destroy() method)
     */
    createAction() {},
    executeCommand() {},
  },
  events: {
    /**
     * is-active (plugin is active)
     * is-inactive (plugin is inactive)
     * app-ready
     */
    on(event: string, cb: Function) {},

    /**
     * Unsubscribe to all events
     */
    off() {},
  },
};
const createLogger = (pluginName: string) => (msg: string) => debug.log(`[${pluginName}]: ${msg}`);

const createContext = (pluginName: string) => {
  const log = createLogger(pluginName);
  /**
   * Should create context with closure of plugin meta (like plugin name, uniq id, manifest)
   */
  log('creating context..');
  return {
    app: {
      /**
       * Returns an allowed set of data from the state visible to plugins
       *
       * Since it is a method, the state can be generated when called.
       * So we can ensure uniqueness of the state, as well as avoid passing values by references.
       */
      getState() {},
    },
    commands: {
      createWindow() {},
      setQuery() {},
      setVariables() {},
      setEndpoint() {},
      isElectron() {},
      /**
       * panel has two locations: sidebar, header
       *
       * Each call creates a new panel. Instead, plugin should create panel only once (@initialize)
       * Panel can be destroyed when the plugin is unused.
       *
       * returns panel instance (includes destroy() method)
       */
      createPanel() {},
      /**
       * action has 1 location for now: resultpane
       *
       * Each call creates a new action. Instead, plugins should create action once, when needed
       * Action can be destroyed when the plugin decides to.
       *
       * returns action instance (includes destroy() method)
       */
      createAction() {},
      executeCommand() {},
    },
    events: {
      /**
       * is-active (plugin is active)
       * is-inactive (plugin is inactive)
       * app-ready
       */
      on(event: string, cb: Function) {},

      /**
       * Unsubscribe to all events
       */
      off() {},
    },
  };
};
