import { ICustomTheme } from '../../theme';
import { ExportWindowState } from '../../types/state/window.interfaces';
import {
  CreateActionOptions,
  CreatePanelOptions,
  PluginWindowState,
} from '../context/context.interface';
import { PluginEvent, PluginEventCallback } from '../event/event.interfaces';

export interface PluginV3Context {
  /**
   * Returns data about a window (tab) in the app
   */
  getWindowState(windowId: string): Promise<PluginWindowState | undefined>;

  /**
   * Returns data about the current window (tab) in the app
   */
  getCurrentWindowState(): Promise<PluginWindowState | undefined>;

  /**
   * Create an AltairPanel instance for displaying content in the app based on the panel name.
   * The panel names are defined in the plugin options when the plugin is initialized.
   *
   * This returns the unique id of the panel.
   */
  // TODO: improve the type checking for the panelName based on the plugin options
  // TODO: https://www.basedash.com/blog/typescript-object-with-dynamic-keys
  // TODO: https://github.com/whatwg/html/issues/5484#issuecomment-620481794
  createPanel(
    panelName: string,
    options?: CreatePanelOptions
  ): Promise<string | undefined>;

  /**
   * Destroy a panel based on its unique id
   */
  destroyPanel(panelId: string): Promise<void>;

  /**
   * Adds an action button in the app to perform an action.
   * The action is defined by the plugin and is executed when the button is clicked.
   *
   * This returns the unique id of the action.
   */
  createAction(options: CreateActionOptions): Promise<string | undefined>;

  /**
   * Destroy an action based on its unique id
   */
  destroyAction(actionId: string): Promise<void>;

  /**
   * Check if the app is running in an Electron environment
   */
  isElectron(): Promise<boolean>;

  /**
   * Create a new window in the app with the given data
   */
  createWindow(data: ExportWindowState): Promise<void>;

  /**
   * Set the query in the app for the given window
   */
  setQuery(windowId: string, query: string): Promise<void>;

  /**
   * Set the variables in the app for the given window
   */
  setVariables(windowId: string, variables: string): Promise<void>;

  /**
   * Add a header in the app for the given window
   */
  setHeader(windowId: string, key: string, value: string): Promise<void>;

  /**
   * Set the endpoint in the app for the given window
   */
  setEndpoint(windowId: string, url: string): Promise<void>;

  // TODO:
  // addSubscriptionProvider(providerData: SubscriptionProviderData): void;

  /**
   * Subscribe to an event in the app to perform an action within the plugin
   */
  on<E extends PluginEvent>(
    event: E,
    callback: PluginEventCallback<E>
  ): {
    unsubscribe: () => void;
  };

  /**
   * Remove all the event listeners
   */
  off(): void;

  /**
   * Add a custom theme to Altair's theme registry which can later be used
   */
  addTheme(name: string, theme: ICustomTheme): Promise<void>;

  /**
   * Enable a theme in the app
   */
  enableTheme(name: string, darkMode?: boolean): Promise<void>;
}
