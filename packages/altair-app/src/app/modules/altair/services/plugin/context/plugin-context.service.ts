import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { v4 as uuid } from 'uuid';
import {
  CreateActionOptions,
  CreatePanelOptions,
  PluginContext,
  PluginContextGenerator,
  PluginWindowState,
} from 'altair-graphql-core/build/plugin/context/context.interface';
import isElectron from 'altair-graphql-core/build/utils/is_electron';
import {
  PluginEvent,
  PluginEventCallback,
} from 'altair-graphql-core/build/plugin/event/event.interfaces';
import { ICustomTheme } from 'altair-graphql-core/build/theme';
import { ExportWindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import { SubscriptionProviderData } from 'altair-graphql-core/build/subscriptions';
import { AltairV1Plugin } from 'altair-graphql-core/build/plugin/plugin.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { debug } from '../../../utils/logger';

import { WindowService } from '../../../services/window.service';

import * as fromRoot from '../../../store';

import * as queryActions from '../../../store/query/query.action';
import * as variablesActions from '../../../store/variables/variables.action';
import * as headersActions from '../../../store/headers/headers.action';
import * as localActions from '../../../store/local/local.action';
import * as settingsActions from '../../../store/settings/settings.action';

import { PluginEventService } from '../plugin-event.service';
import { take } from 'rxjs/operators';
import { ThemeRegistryService } from '../../../services/theme/theme-registry.service';
import { NotifyService } from '../../../services/notify/notify.service';
import { headerListToMap, headerMapToList } from '../../../utils/headers';
import {
  AltairPanel,
  AltairPanelLocation,
} from 'altair-graphql-core/build/plugin/panel';
import {
  AltairUiAction,
  AltairUiActionLocation,
} from 'altair-graphql-core/build/plugin/ui-action';
import { PluginV3Manifest } from 'altair-graphql-core/build/plugin/v3/manifest';
import { PluginV3Context } from 'altair-graphql-core/build/plugin/v3/context';
import {
  PluginParentWorker,
  PluginParentWorkerOptions,
} from 'altair-graphql-core/build/plugin/v3/parent-worker';
import { PluginParentEngine } from 'altair-graphql-core/build/plugin/v3/parent-engine';
import { RequestHandlerRegistryService } from '../../request/request-handler-registry.service';
import { SubscriptionProviderRequestHandlerAdapter } from 'altair-graphql-core/build/request/adapters';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { apiClient } from '../../api/api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PluginContextService implements PluginContextGenerator {
  private store = inject<Store<RootState>>(Store);
  private windowService = inject(WindowService);
  private pluginEventService = inject(PluginEventService);
  private themeRegistryService = inject(ThemeRegistryService);
  private requestHandlerRegistryService = inject(RequestHandlerRegistryService);
  private notifyService = inject(NotifyService);
  private sanitizer = inject(DomSanitizer);


  createV1Context(pluginName: string, plugin: AltairV1Plugin): PluginContext {
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
          {
            location = AltairPanelLocation.SIDEBAR,
            title = plugin.display_name,
          }: CreatePanelOptions = {}
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
            self.store.dispatch(
              new localActions.RemovePanelAction({ panelId: panel.id })
            );
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
          const uiAction = new AltairUiAction(title, location, async () => {
            const state = await self.getCurrentWindowState();
            if (state) {
              execute(state);
            }
          });

          self.store.dispatch(new localActions.AddUiActionAction(uiAction));

          return uiAction;
        },
        destroyAction(uiAction: AltairUiAction) {
          log(`Destroying ui action<${uiAction.title}:[${uiAction.id}]>`);
          if (uiAction instanceof AltairUiAction) {
            self.store.dispatch(
              new localActions.RemoveUiActionAction({ actionId: uiAction.id })
            );
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
          self.store.dispatch(
            new variablesActions.UpdateVariablesAction(variables, windowId)
          );
        },
        setEndpoint(windowId: string, url: string) {
          log('setting endpoint');
          self.store.dispatch(new queryActions.SetUrlAction({ url }, windowId));
          self.store.dispatch(
            new queryActions.SendIntrospectionQueryRequestAction(windowId)
          );
        },
        async setHeader(windowId, key, value) {
          log(`setting header: ${key}`);
          const state = await this.getWindowState(windowId);
          const headers = state?.headers ?? [];
          const obj = headerListToMap(headers);

          obj[key] = value;
          self.store.dispatch(
            new headersActions.SetHeadersAction(
              { headers: headerMapToList(obj) },
              windowId
            )
          );
        },
        addSubscriptionProvider(providerData: SubscriptionProviderData) {
          log(`adding subscription provider: ${providerData.id}`);
          // transform providerData to the new format
          self.requestHandlerRegistryService.addHandlerData({
            id: providerData.id,
            async getHandler() {
              return new SubscriptionProviderRequestHandlerAdapter(
                await providerData.getProviderClass()
              );
            },
            copyTag: providerData.copyTag,
          });
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
          const settings = {
            ...(await self.store.select('settings').pipe(take(1)).toPromise()),
          };

          if (darkMode) {
            settings['theme.dark'] = `plugin:${name}` as any;
          } else {
            settings.theme = `plugin:${name}` as any;
          }
          self.store.dispatch(
            new settingsActions.SetSettingsJsonAction({
              value: JSON.stringify(settings),
            })
          );
          self.notifyService.info(
            `Plugin "${pluginName}" has enabled the "${name}" theme`
          );
        },
      },
    };
  }

  createV3Context(
    pluginName: string,
    manifest: PluginV3Manifest,
    parentWorkerOptions: PluginParentWorkerOptions
  ): PluginV3Context {
    const self = this;
    const log = (msg: string, ...args: unknown[]) =>
      debug.log(`PLUGIN[${pluginName}]: ${msg}`, ...args);
    const eventBus = this.pluginEventService.group();

    log('creating context..');
    const ctx: PluginV3Context = {
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
      async createPanel(
        panelName: string,
        {
          location = AltairPanelLocation.SIDEBAR,
          title = manifest.display_name ?? manifest.name,
          width,
        }: CreatePanelOptions = {}
      ) {
        log(`Creating panel<${panelName}, ${title}>`);
        // create and setup panel iframe
        const id = `panel-${uuid()}`;
        const panelWorker = new PluginParentWorker({
          ...parentWorkerOptions,
          id,
          instanceType: 'panel',
          disableAppend: true,
          width,
          additionalParams: {
            panelName,
          },
        });
        const iconUrl = manifest.icon?.type === 'image' ? manifest.icon.url : '';
        let iconSvg: SafeHtml = '';
        if (manifest.icon?.type === 'svg') {
          const DOMPurify = await import('dompurify');
          const sanitized = DOMPurify.default.sanitize(manifest.icon.src);
          iconSvg = self.sanitizer.bypassSecurityTrustHtml(sanitized);
        }

        const settings = await firstValueFrom(
          self.store.select('settings').pipe(take(1))
        );
        const selectedTheme = self.themeRegistryService.getTheme(settings.theme) || {
          isSystem: true,
        };
        const settingsThemeConfig = settings.themeConfig || {};
        const theme = self.themeRegistryService.mergeThemes(
          selectedTheme,
          settingsThemeConfig
        );
        const engine = new PluginParentEngine(panelWorker, { theme });
        const panel = new AltairPanel(
          title,
          panelWorker.getIframe(),
          location,
          engine,
          iconUrl,
          iconSvg
        );
        engine.start(ctx);
        self.store.dispatch(new localActions.AddPanelAction(panel));
        return panel.id;
      },
      async destroyPanel(id: string) {
        const local = await self.store.select('local').pipe(take(1)).toPromise();

        const panel = local?.panels.find((p) => p.id === id);
        if (panel) {
          log(`Destroying panel<${panel.title}:[${panel.id}]>`);
          if (panel instanceof AltairPanel) {
            panel.engine?.destroy();
            panel.destroy();
            self.store.dispatch(
              new localActions.RemovePanelAction({ panelId: panel.id })
            );
          }
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
      async createAction({
        title,
        location = AltairUiActionLocation.RESULT_PANE,
        execute,
      }: CreateActionOptions) {
        log(`Creating ui action<${title}>`);
        const uiAction = new AltairUiAction(title, location, async () => {
          const state = await self.getCurrentWindowState();
          if (state) {
            execute(state);
          }
        });

        self.store.dispatch(new localActions.AddUiActionAction(uiAction));

        return uiAction.id;
      },
      async destroyAction(actionId: string) {
        log(`Destroying ui action<[${actionId}]>`);
        self.store.dispatch(new localActions.RemoveUiActionAction({ actionId }));
      },
      async isElectron(): Promise<boolean> {
        return isElectron;
      },
      async createWindow(data: ExportWindowState) {
        log('creating window');
        await self.windowService.importWindowData(data);
      },
      async setQuery(windowId: string, query: string) {
        log('setting query');
        self.store.dispatch(new queryActions.SetQueryAction(query, windowId));
      },
      async setVariables(windowId: string, variables: string) {
        log('setting variables');
        self.store.dispatch(
          new variablesActions.UpdateVariablesAction(variables, windowId)
        );
      },
      async setEndpoint(windowId: string, url: string) {
        log('setting endpoint');
        self.store.dispatch(new queryActions.SetUrlAction({ url }, windowId));
        self.store.dispatch(
          new queryActions.SendIntrospectionQueryRequestAction(windowId)
        );
      },
      async setHeader(windowId, key, value) {
        log(`setting header: ${key}`);
        const state = await this.getWindowState(windowId);
        const headers = state?.headers ?? [];
        const obj = headerListToMap(headers);

        obj[key] = value;
        self.store.dispatch(
          new headersActions.SetHeadersAction(
            { headers: headerMapToList(obj) },
            windowId
          )
        );
      },
      // TODO: will need an adaptation to the new plugin system. Can tackle if needed.
      // addSubscriptionProvider(providerData: SubscriptionProviderData) {
      //   log(`adding subscription provider: ${providerData.id}`);
      //   self.subscriptionProviderRegistryService.addProviderData(providerData);
      // },
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
      async addTheme(name: string, theme: ICustomTheme) {
        log('Adding theme: ' + name);
        return self.themeRegistryService.addTheme(`plugin:${name}`, theme);
      },
      async enableTheme(name: string, darkMode = false) {
        log('Enabling theme: ' + name);
        const settings = {
          ...(await self.store.select('settings').pipe(take(1)).toPromise()),
        };

        if (darkMode) {
          settings['theme.dark'] = `plugin:${name}` as any;
        } else {
          settings.theme = `plugin:${name}` as any;
        }
        self.store.dispatch(
          new settingsActions.SetSettingsJsonAction({
            value: JSON.stringify(settings),
          })
        );
        self.notifyService.info(
          `Plugin "${pluginName}" has enabled the "${name}" theme`
        );
      },
      async getUserInfo() {
        const account = await firstValueFrom(
          self.store.select('account').pipe(take(1))
        );
        return {
          avatar: account.picture,
          email: account.email,
          loggedIn: account.loggedIn,
          name: account.firstName,
          plan: account.plan,
        };
      },
      async getAvailableCredits() {
        return await apiClient.getAvailableCredits();
      },
      async createAiSession() {
        return await apiClient.createAiSession();
      },
      async getActiveAiSession() {
        return await apiClient.getActiveAiSession();
      },
      async getAiSessionMessages(sessionId) {
        return await apiClient.getAiSessionMessages(sessionId);
      },
      sendMessageToAiSession(sessionId, message) {
        return apiClient.sendMessageToAiSession(sessionId, message);
      },
      rateAiSessionMessage(sessionId, messageId, rating) {
        return apiClient.rateAiMessage(sessionId, messageId, { rating });
      },
    };

    return ctx;
  }

  private async getWindowState(windowId: string) {
    const data = await this.store
      .select(fromRoot.selectWindowState(windowId))
      .pipe(take(1))
      .toPromise();

    if (!data) {
      return;
    }

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
      postRequestScript: data.postRequest.script,
      postRequestScriptEnabled: data.postRequest.enabled,
      requestHandlerId: data.query.requestHandlerId,
      requestHandlerAdditionalParams: data.query.requestHandlerAdditionalParams,
      subscriptionRequestHandlerId: data.query.subscriptionRequestHandlerId,
      subscriptionConnectionParams: data.query.subscriptionConnectionParams,
      subscriptionUseDefaultRequestHandler:
        data.query.subscriptionUseDefaultRequestHandler,
      authorizationType: data.authorization.type,
      authorizationData: data.authorization.data,
      sdl: data.schema.sdl,
      queryResults: data.query.responses?.map((r) => r.content) ?? [],
      requestStartTime: data.query.requestStartTime,
      requestEndTime: data.query.requestEndTime,
      responseTime: data.query.responseTime,
      responseStatus: data.query.responseStatus,
    };

    return pluginWindowState;
  }

  private async getCurrentWindowState() {
    const windowMeta = await this.store
      .select('windowsMeta')
      .pipe(take(1))
      .toPromise();
    if (!windowMeta) {
      return;
    }
    return this.getWindowState(windowMeta.activeWindowId);
  }
}
