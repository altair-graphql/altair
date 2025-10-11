import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
  ApplicationInitStatus,
  ModuleWithProviders,
  CSP_NONCE,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HttpClient,
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ToastrModule } from 'ngx-toastr';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { CookieService } from 'ngx-cookie-service';

import { SharedModule } from './modules/shared/shared.module';

import { getReducer, metaReducers, reducerToken } from './store';

import { QueryEffects } from './effects/query.effect';
import { WindowsEffects } from './effects/windows.effect';
import { WindowsMetaEffects } from './effects/windows-meta.effect';
import { QueryCollectionEffects } from './effects/query-collection.effect';
import { PluginEventEffects } from './effects/plugin-event.effect';
import { LocalEffects } from './effects/local.effect';

import { DirectivesModule } from './directives';
import { ComponentModule } from './components/components.module';
import { DocViewerModule } from './components/doc-viewer/doc-viewer.module';
import { SchemaFormModule } from './components/schema-form/schema-form.module';

import { AltairComponent } from './containers/altair/altair.component';
import { WindowComponent } from './containers/window/window.component';

import * as services from './services';
import { HTTPErrorInterceptor } from './interceptors/http-error.interceptor';
import { GlobalErrorHandler } from './error-handler';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AppOverlayContainer } from './overlay-container';
import { AppInitAction } from './store/action';
import { ReducerBootstrapper } from './store/reducer-bootstrapper';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { AccountEffects } from './effects/account.effect';
import { WorkspaceEffects } from './effects/workspace.effect';
import { ElectronEffects } from './effects/electron.effect';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { environment } from 'environments/environment';

registerLocaleData(en);

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  // Using relative path to the translation files to ensure cross platform compatibility (majorly because of the electron apps)
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function reducerBootstrapFactory(reducer: ReducerBootstrapper) {
  // bootstrap() returns a Promise
  return () => reducer.bootstrap();
}

const providers = [
  services.ApiService,
  services.GqlService,
  services.DbService,
  services.WindowService,
  services.NotifyService,
  services.DonationService,
  services.ElectronAppService,
  services.KeybinderService,
  services.StorageService,
  services.QueryCollectionService,
  services.EnvironmentService,
  services.PluginRegistryService,
  services.PluginEventService,
  services.PreRequestService,
  services.ThemeRegistryService,
  services.PluginContextService,
  services.QueryService,
  services.AccountService,
  services.SharingService,
  services.FilesService,
  services.RequestHandlerRegistryService,
  services.WebExtensionsService,
  // Setting the reducer provider in main.ts now (for proper config initialization)
  // reducerProvider,
  CookieService,
  ReducerBootstrapper,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HTTPErrorInterceptor,
    multi: true,
  },
  {
    provide: ErrorHandler,
    useClass: GlobalErrorHandler,
  },
  {
    provide: OverlayContainer,
    useClass: AppOverlayContainer,
    // useFactory: () => new AppOverlayContainer()
  },
  provideAppInitializer(() => {
    const initializerFn = reducerBootstrapFactory(inject(ReducerBootstrapper));
    return initializerFn();
  }),
  provideHttpClient(withInterceptorsFromDi()),
];

@NgModule({
  declarations: [AltairComponent, WindowComponent],
  bootstrap: [AltairComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [AltairComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule.forRoot(),
    ComponentModule,
    DocViewerModule,
    SchemaFormModule,
    DirectivesModule,
    StoreModule.forRoot(reducerToken, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
      },
      // initialState: {},
    }),
    EffectsModule.forRoot([
      QueryEffects,
      WindowsEffects,
      WindowsMetaEffects,
      QueryCollectionEffects,
      PluginEventEffects,
      LocalEffects,
      AccountEffects,
      WorkspaceEffects,
      ElectronEffects,
    ]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    ToastrModule.forRoot({
      newestOnTop: false,
      closeButton: true,
      positionClass: 'toast-bottom-right',
      enableHtml: true,
      countDuplicates: true,
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true,
    }),
  ],
  providers,
})
export class AltairModule {
  constructor() {
    const applicationInitStatus = inject(ApplicationInitStatus);
    const store = inject<Store<RootState>>(Store);
    const reducerBootstrapper = inject(ReducerBootstrapper);

    applicationInitStatus.donePromise.then(() =>
      store.dispatch(
        new AppInitAction({ initialState: reducerBootstrapper.initialState })
      )
    );
  }

  static forRoot(): ModuleWithProviders<AltairModule> {
    return {
      ngModule: AltairModule,
      providers: [
        // Setting reducer provider here (after setting altair config),
        // so the reducers are initialized with the right config
        {
          provide: reducerToken,
          useValue: getReducer(),
        },
        {
          provide: CSP_NONCE,
          useFactory: (altairConfig: AltairConfig) => altairConfig.cspNonce,
          deps: [AltairConfig],
        },
      ],
    };
  }
}
