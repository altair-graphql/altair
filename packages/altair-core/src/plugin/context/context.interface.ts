import { SubscriptionProviderData } from '../../subscriptions';
import { ICustomTheme } from '../../theme';
import { ExportWindowState } from '../../types/state/window.interfaces';
import { PluginEvent, PluginEventCallback } from '../event/event.interfaces';
import { AltairPanel, AltairPanelLocation } from '../panel';
import { AltairV1Plugin } from '../plugin.interfaces';
import { AltairUiAction, AltairUiActionLocation } from '../ui-action';

export interface CreatePanelOptions {
  title?: string;
  location?: AltairPanelLocation;
  width?: number;
}

export interface CreateActionOptions {
  title: string;
  location?: AltairUiActionLocation;
  execute: (data: PluginWindowState) => void;
}

export interface PluginWindowState extends ExportWindowState {
  windowId: string;
  sdl: string;
  queryResults: string[];
  requestStartTime: number;
  requestEndTime: number;
  responseTime: number;
  responseStatus: number;
}

// TODO:
export interface PluginContext {
  app: {
    /**
     * resolves with the state of the specified window
     */
    getWindowState(windowId: string): Promise<PluginWindowState | undefined>;
    getCurrentWindowState(): Promise<PluginWindowState | undefined>;
    /**
     * for rendering the provided DOM element in a new panel within Altair
     */
    createPanel(element: HTMLElement, options?: CreatePanelOptions): AltairPanel;
    destroyPanel(panel: AltairPanel): void;

    /**
     * for rendering an action button with the specified title and the callback to execute when the button is clicked
     */
    createAction(options: CreateActionOptions): AltairUiAction;
    destroyAction(uiAction: AltairUiAction): void;

    isElectron(): boolean;
    createWindow(data: ExportWindowState): void;
    setQuery(windowId: string, query: string): void;
    setVariables(windowId: string, variables: string): void;
    setHeader(windowId: string, key: string, value: string): void;
    setEndpoint(windowId: string, url: string): void;

    /**
     * adds a provider for subscriptions
     */
    addSubscriptionProvider(providerData: SubscriptionProviderData): void;
    executeCommand(): void; // TODO: To be defined
  };
  events: {
    /**
     * listens for events within Altair to perform an action within the plugin
     */
    on<E extends PluginEvent>(
      event: E,
      callback: PluginEventCallback<E>
    ): {
      unsubscribe: () => void;
    };
    off(): void;
  };
  theme: {
    /**
     * adds the provided theme to Altair's theme registry which can later be used
     */
    add(name: string, theme: ICustomTheme): void;

    /**
     * enables the specified theme
     */
    enable(name: string, darkMode?: boolean): Promise<void>;
  };
}

export interface PluginContextGenerator {
  createV1Context(pluginName: string, plugin: AltairV1Plugin): PluginContext;
}
