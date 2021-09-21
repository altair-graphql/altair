import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CreateActionOptions, CreatePanelOptions, PluginContextGenerator, PluginWindowState } from 'altair-graphql-core/build/plugin/context/context.interface';
import isElectron from 'altair-graphql-core/build/utils/is_electron';
import { PluginEvent, PluginEventCallback } from 'altair-graphql-core/build/plugin/event/event.interfaces';
import { ICustomTheme } from 'altair-graphql-core/build/theme';
import { ExportWindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import { SubscriptionProviderData } from 'altair-graphql-core/build/subscriptions';
import { AltairPlugin } from 'altair-graphql-core/build/plugin/plugin.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { debug } from '../../../utils/logger';

import { WindowService } from '../../../services/window.service';

import * as fromRoot from '../../../store';

import * as queryActions from '../../../store/query/query.action';
import * as variablesActions from '../../../store/variables/variables.action';
import * as localActions from '../../../store/local/local.action';
import * as settingsActions from '../../../store/settings/settings.action';

import { PluginEventService } from '../plugin-event.service';
import { first } from 'rxjs/operators';
import { ThemeRegistryService } from '../../../services/theme/theme-registry.service';
import { NotifyService } from '../../../services/notify/notify.service';
import { SubscriptionProviderRegistryService } from '../../subscriptions/subscription-provider-registry.service';
import { AltairPanel, AltairPanelLocation } from 'altair-graphql-core/build/plugin/panel';
import { AltairUiAction, AltairUiActionLocation } from 'altair-graphql-core/build/plugin/ui-action';

@Injectable({
  providedIn: 'root'
})
export class PluginContextService implements PluginContextGenerator {
  constructor(
    private store: Store<RootState>,
    private windowService: WindowService,
    private pluginEventService: PluginEventService,
    private themeRegistryService: ThemeRegistryService,
    private subscriptionProviderRegistryService: SubscriptionProviderRegistryService,
    private notifyService: NotifyService,
  ) {}

  createContext(pluginName: string, plugin: AltairPlugin) {
    const self = this;
    const log = (msg: string) => debug.log(`PLUGIN[${pluginName}]: ${msg}`);
    const eventBus = this.pluginEventService.group();

    log('creating context..');
    return {
      app: {
        /**
         * Returns an allowed set of data from the state visible to plugins
         *
         * Since it is a method, the state can be generated when called.
         * So we can ensure uniqueness of the state, as well as avoid passing values by references.
         */
        async getWindowState(windowId: string) {
          return self.getWindowState(windowId);
        },

        async getCurrentWindowState() {
          return self.getCurrentWindowState();
        },
        /**
         * panel has two locations: sidebar, header
         *
         * Each call creates a new panel. Instead, plugin should create panel only once (@initialize)
         * Panel can be destroyed when the plugin is unused.
         *
         * returns panel instance (includes destroy() method)
         */
        createPanel(
          element: HTMLElement,
          { location = AltairPanelLocation.SIDEBAR, title = plugin.display_name }: CreatePanelOptions = {},
        ) {
          log(`Creating panel<${title}>`);
          const panel = new AltairPanel(title, element, location);
          self.store.dispatch(new localActions.AddPanelAction(panel));
          return panel;
        },
        destroyPanel(panel: AltairPanel) {
          log(`Destroying panel<${panel.title}:[${panel.id}]>`);
          if (panel instanceof AltairPanel) {
            panel.destroy();
            self.store.dispatch(new localActions.RemovePanelAction({ panelId: panel.id }));
          }
        },
        /**
         * action has 1 location for now: resultpane
         *
         * Each call creates a new action. Instead, plugins should create action once, when needed
         * Action can be destroyed when the plugin decides to.
         *
         * returns action instance (includes destroy() method)
         */
        createAction({
          title,
          location = AltairUiActionLocation.RESULT_PANE,
          execute,
        }: CreateActionOptions) {
          log(`Creating ui action<${title}>`);
          const uiAction = new AltairUiAction(title, location, async() => {
            const state = await self.getCurrentWindowState();
            execute(state);
          });

          self.store.dispatch(new localActions.AddUiActionAction(uiAction));

          return uiAction;
        },
        destroyAction(uiAction: AltairUiAction) {
          log(`Destroying ui action<${uiAction.title}:[${uiAction.id}]>`);
          if (uiAction instanceof AltairUiAction) {
            self.store.dispatch(new localActions.RemoveUiActionAction({ actionId: uiAction.id }));
          }
        },
        isElectron() {
          return isElectron;
        },
        createWindow(data: ExportWindowState) {
          log('creating window');
          return self.windowService.importWindowData(data);
        },
        setQuery(windowId: string, query: string) {
          log('setting query');
          self.store.dispatch(new queryActions.SetQueryAction(query, windowId));
        },
        setVariables(windowId: string, variables: string) {
          log('setting variables');
          self.store.dispatch(new variablesActions.UpdateVariablesAction(variables, windowId));
        },
        setEndpoint(windowId: string, url: string) {
          log('setting endpoint');
          self.store.dispatch(new queryActions.SetUrlAction({ url }, windowId));
          self.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(windowId));
        },
        addSubscriptionProvider(providerData: SubscriptionProviderData) {
          log(`adding subscription provider: ${providerData.id}`);
          self.subscriptionProviderRegistryService.addProviderData(providerData);
        },
        executeCommand() {
          // TODO: To be implemented...
        },
      },
      events: {
        /**
         * subscribe to events
         */
        on<E extends PluginEvent>(event: E, callback: PluginEventCallback<E>) {
          return eventBus.on(event, callback);
        },

        /**
         * Unsubscribe to all events
         */
        off() {
          log('unsubscribing from all events');
          return eventBus.unsubscribe();
        },
      },
      theme: {
        add(name: string, theme: ICustomTheme) {
          log('Adding theme: ' + name);
          return self.themeRegistryService.addTheme(`plugin:${name}`, theme);
        },
        async enable(name: string, darkMode = false) {
          log('Enabling theme: ' + name);
          const settings = { ...await self.store.select('settings').pipe(first()).toPromise() };

          if (darkMode) {
            settings['theme.dark'] = `plugin:${name}` as any;
          } else {
            settings.theme = `plugin:${name}` as any;
          }
          self.store.dispatch(new settingsActions.SetSettingsJsonAction({ value: JSON.stringify(settings) }));
          self.notifyService.info(`Plugin "${pluginName}" has enabled the "${name}" theme`);
        },
      },
    };
  }

  private async getWindowState(windowId: string) {
    const data = await this.store.select(fromRoot.selectWindowState(windowId)).pipe(first()).toPromise();

    const pluginWindowState: PluginWindowState = {
      version: 1,
      type: 'window',
      windowId: windowId,
      query: data.query.query || '',
      apiUrl: data.query.url,
      variables: data.variables.variables,
      subscriptionUrl: data.query.subscriptionUrl,
      headers: data.headers,
      windowName: data.layout.title,
      preRequestScript: data.preRequest.script,
      preRequestScriptEnabled: data.preRequest.enabled,
      sdl: data.schema.sdl,
      queryResult: data.query.response,
      requestStartTime: data.query.requestStartTime,
      requestEndTime: data.query.requestEndTime,
      responseTime: data.query.responseTime,
      responseStatus: data.query.responseStatus,
    };

    return pluginWindowState;
  }

  private async getCurrentWindowState() {
    const windowMeta = await this.store.select('windowsMeta').pipe(first()).toPromise();
    return this.getWindowState(windowMeta.activeWindowId);
  }
}
