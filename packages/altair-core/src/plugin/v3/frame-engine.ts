import { v4 as uuid } from 'uuid';
import { PluginV3Context } from './context';
import {
  PLUGIN_CREATE_ACTION_EVENT,
  PLUGIN_ENGINE_READY,
  PLUGIN_GET_APP_STYLE_URL_EVENT,
  PLUGIN_SUBSCRIBE_TO_EVENT,
  getActionEvent,
} from './events';
import { PluginFrameWorker, instanceTypes } from './frame-worker';
import { PluginV3Options } from './plugin';
import { PluginWindowState } from '../context/context.interface';

export class PluginFrameEngine {
  private readyPromise: Promise<void>;
  private eventListeners: Record<string, Function[]> = {};
  private ctx?: PluginV3Context;

  constructor(
    private worker: PluginFrameWorker,
    private options: PluginV3Options
  ) {
    this.readyPromise = new Promise((resolve) => {
      this.worker.subscribe(PLUGIN_ENGINE_READY, () => {
        resolve();
      });
    });

    // check if this is a panel frame so we can handle the panel logic specially
    const panelName = worker.getParams().panelName;
    if (worker.getInstanceType() === instanceTypes.PANEL && panelName) {
      this.handlePanelSetup(panelName);
    }

    // TODO: Pass the panels list to the parent engine for validation, in case the plugin tries to create a panel that doesn't exist

    // TODO: skip the main frame only events if the frame is not the main frame
  }

  async ready() {
    await this.readyPromise;
  }

  canInitialize() {
    return this.worker.getInstanceType() === instanceTypes.MAIN;
  }

  private createContext(): PluginV3Context {
    const ctx: PluginV3Context = {
      getWindowState: (...args) => {
        return this.worker.request('getWindowState', ...args);
      },
      getCurrentWindowState: (...args) => {
        return this.worker.request('getCurrentWindowState', ...args);
      },
      createPanel: async (...args) => {
        return this.worker.request('createPanel', ...args);
      },
      destroyPanel: async (...args) => {
        return this.worker.request('destroyPanel', ...args);
      },
      createAction: async (opts) => {
        // send action event to the parent engine without callback
        // subscribe to the action event from the parent engine
        const optsWithoutExecute = { ...opts, execute: undefined };
        const idPromise: ReturnType<PluginV3Context['createAction']> =
          this.worker.request(PLUGIN_CREATE_ACTION_EVENT, optsWithoutExecute);
        const id = await idPromise;
        if (id) {
          this.worker.respond(getActionEvent(id), async (data) => {
            opts.execute(data as PluginWindowState);
          });
        }
        return id;
      },
      destroyAction: async (...args) => {
        return this.worker.request('destroyAction', ...args);
      },
      isElectron: async (...args) => {
        return !!(await this.worker.request('isElectron', ...args));
      },
      createWindow: (...args) => {
        return this.worker.request('createWindow', ...args);
      },
      setQuery: (...args) => {
        return this.worker.request('setQuery', ...args);
      },
      setVariables: (...args) => {
        return this.worker.request('setVariables', ...args);
      },
      setHeader: (...args) => {
        return this.worker.request('setHeader', ...args);
      },
      setEndpoint: (...args) => {
        return this.worker.request('setEndpoint', ...args);
      },
      on: (event, callback) => {
        this.worker.request(PLUGIN_SUBSCRIBE_TO_EVENT, event);
        this.eventListeners[event] = this.eventListeners[event] || [];
        const listeners = this.eventListeners[event];
        if (listeners) {
          listeners.push(callback);
        }
        this.worker.respond(event, async (...args) => {
          const listeners = this.eventListeners[event];
          if (!listeners) {
            return;
          }
          listeners.forEach((listener) => listener(...args));
        });

        return {
          unsubscribe: () => {
            this.eventListeners[event] = (this.eventListeners[event] ?? []).filter(
              (listener) => listener !== callback
            );
          },
        };
      },
      off: () => {
        this.eventListeners = {};
        this.worker.request('off');
      },
      addTheme: (...args) => {
        return this.worker.request('addTheme', ...args);
      },
      enableTheme: (...args) => {
        return this.worker.request('enableTheme', ...args);
      },
    };

    this.ctx = ctx;

    return ctx;
  }

  getContext() {
    if (!this.ctx) {
      return this.createContext();
    }
    return this.ctx;
  }

  private async handlePanelSetup(panelName: string) {
    const panel = this.options.panels[panelName];

    if (panel) {
      // setup styles in the panel
      panel.initialize(
        this.getContext(),
        await this.worker.request(PLUGIN_GET_APP_STYLE_URL_EVENT)
      );
    }
  }
}
