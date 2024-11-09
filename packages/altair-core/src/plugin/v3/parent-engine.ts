import { ICustomTheme } from '../../theme';
import { CreateActionOptions } from '../context/context.interface';
import { PluginEventPayloadMap } from '../event/event.interfaces';
import { PluginV3Context } from './context';
import {
  PLUGIN_CREATE_ACTION_EVENT,
  PLUGIN_ENGINE_READY,
  PLUGIN_GET_APP_STYLE_URL_EVENT,
  PLUGIN_SUBSCRIBE_TO_EVENT,
  getActionEvent,
} from './events';
import { instanceTypes } from './frame-worker';
import { PluginParentWorker } from './parent-worker';

const mainInstanceOnlyEvents: (keyof PluginV3Context)[] = [
  'createPanel',
  'destroyPanel',
  'createAction',
];

// methods to be excluded from the generic listener creation since they are handled specially
const speciallyHandledMethods: (keyof PluginV3Context)[] = ['on', 'createAction'];

function getCssStyles(relevantClasses: string[]) {
  try {
    const styleSheets = Array.from(document.styleSheets);
    return styleSheets
      .map((sheet) => {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('');
      })
      .filter((css) => {
        return relevantClasses.some((htmlClass) => css.includes(`.${htmlClass}`));
      });
  } catch {
    return [];
  }
}
interface PluginParentEngineOptions {
  theme?: ICustomTheme;
}
export class PluginParentEngine {
  private context?: PluginV3Context;
  subscribedEvents: string[] = [];

  constructor(
    private worker: PluginParentWorker,
    private opts?: PluginParentEngineOptions
  ) {}

  start(context: PluginV3Context) {
    this.context = context;
    this.prepareListeners();
    this.handleEvents();
    if (this.worker.getInstanceType() === instanceTypes.MAIN) {
      this.handleActionEvents();
    }

    // send a message to the worker to indicate that the plugin engine is ready
    this.worker.send(PLUGIN_ENGINE_READY);
  }

  prepareListeners() {
    if (!this.context) {
      return;
    }
    // loop over all the context object method and create a listener for each
    Object.entries(this.context).forEach(([k, fn]) => {
      // skip the methods that are handled specially
      if (speciallyHandledMethods.includes(k as keyof PluginV3Context)) {
        return;
      }
      // skip the main frame only events if the frame is not the main frame
      if (
        this.worker.getInstanceType() !== instanceTypes.MAIN &&
        mainInstanceOnlyEvents.includes(k as keyof PluginV3Context)
      ) {
        return;
      }
      this.worker.respond(k, async (...args) => {
        return fn(...args);
      });
    });
  }

  handleEvents() {
    this.worker.respond(PLUGIN_SUBSCRIBE_TO_EVENT, async (event) => {
      if (typeof event !== 'string') {
        return;
      }

      // we only need to subscribe to an event once here. In the frame, we manage the listeners separately
      if (this.subscribedEvents.includes(event)) {
        return;
      }

      if (!this.context) {
        return;
      }

      this.context.on(event as unknown as keyof PluginEventPayloadMap, (...args) => {
        this.worker.request(event, ...args);
      });

      // keep track of the events that have been subscribed to
      this.subscribedEvents.push(event);
    });

    this.worker.respond(PLUGIN_GET_APP_STYLE_URL_EVENT, async () => {
      const styleSheets = Array.from(document.styleSheets);
      // Get the style sheet URLs

      // FYI for some reason I haven't figured out yet, we can't link to the stylesheets
      // in the browser extensions directly from the sandboxed iframe.
      const styleUrls = styleSheets
        .map((sheet) => {
          if (sheet?.href) {
            return sheet.href;
          }
          return '';
        })
        .filter(Boolean);

      const htmlClasses = Array.from(document.documentElement.classList);
      // Get the styles that are applicable to the current theme of the page
      // Doesn't work crossorigin cases. e.g. when loading from CDN. Fallback to theme instead.
      const styles = getCssStyles(htmlClasses);

      return { styleUrls, styles, htmlClasses, theme: this.opts?.theme };
    });
  }

  handleActionEvents() {
    // handle the createAction method specially
    this.worker.respond(PLUGIN_CREATE_ACTION_EVENT, async (opts) => {
      if (!this.context) {
        return;
      }
      let id: string | undefined = '';
      // create action and assign the real id to the id variable
      id = await this.context.createAction({
        ...(opts as CreateActionOptions),
        execute: async (...args) => {
          if (!id) {
            return;
          }
          return this.worker.request(getActionEvent(id), ...args);
        },
      });
      return id;
    });
  }

  destroy() {
    this.worker.destroy();
  }
}
