import { SubscriptionProviderData } from '../../subscriptions';
import { ICustomTheme } from '../../theme';
import { ExportWindowState } from '../../types/state/window.interfaces';
import { PluginEvent, PluginEventCallback } from '../event/event.interfaces';
import { AltairPanel, AltairPanelLocation } from '../panel';
import { AltairPlugin } from '../plugin.interfaces';
import { AltairUiAction, AltairUiActionLocation } from '../ui-action';

export interface CreatePanelOptions {
  title?: string;
  location?: AltairPanelLocation;
}

export interface CreateActionOptions {
  title: string;
  location?: AltairUiActionLocation;
  execute: (data: PluginWindowState) => void;
}

export interface PluginWindowState extends ExportWindowState {
  windowId: string;
  sdl: string;
  queryResult: string;
  requestStartTime: number;
  requestEndTime: number;
  responseTime: number;
  responseStatus: number;
}

// TODO:
export interface PluginContext {
  app: {
    /**
     * Returns an allowed set of data from the state visible to plugins
     *
     * Since it is a method, the state can be generated when called.
     * So we can ensure uniqueness of the state, as well as avoid passing values by references.
     */
    getWindowState(windowId: string): Promise<PluginWindowState>;
    getCurrentWindowState(): Promise<PluginWindowState>;
    /**
     * panel has two locations: sidebar, header
     *
     * Each call creates a new panel. Instead, plugin should create panel only once (@initialize)
     * Panel can be destroyed when the plugin is unused.
     *
     * returns panel instance (includes destroy() method)
     */
    createPanel(element: HTMLElement, options?: CreatePanelOptions): AltairPanel;
    destroyPanel(panel: AltairPanel): void;

    /**
     * action has 1 location for now: resultpane
     *
     * Each call creates a new action. Instead, plugins should create action once, when needed
     * Action can be destroyed when the plugin decides to.
     *
     * returns action instance (includes destroy() method)
     */
    createAction(options: CreateActionOptions): AltairUiAction;
    destroyAction(uiAction: AltairUiAction): void;

    isElectron(): boolean;
    createWindow(data: ExportWindowState): void;
    setQuery(windowId: string, query: string): void;
    setVariables(windowId: string, variables: string): void;
    setEndpoint(windowId: string, url: string): void;
    addSubscriptionProvider(providerData: SubscriptionProviderData): void;
    executeCommand(): void; // TODO: To be defined
  };
  events: {
    on<E extends PluginEvent>(event: E, callback: PluginEventCallback<E>): {
      unsubscribe: () => void;
    };
    off(): void;
  };
  theme: {
    add(name: string, theme: ICustomTheme): void;
    enable(name: string, darkMode?: boolean): Promise<void>;
  };
}

export interface PluginContextGenerator {
  createContext(pluginName: string, plugin: AltairPlugin): PluginContext;
}
