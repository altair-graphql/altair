import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
  APP_INITIALIZER,
  ApplicationInitStatus,
  ModuleWithProviders,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HttpClientModule,
  HttpClient,
  HTTP_INTERCEPTORS,
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
import { SmartInputModule } from './components/smart-input/smart-input.module';
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
  services.SubscriptionProviderRegistryService,
  services.PluginContextService,
  services.QueryService,
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
  {
    provide: APP_INITIALIZER,
    deps: [ReducerBootstrapper],
    multi: true,
    useFactory: reducerBootstrapFactory,
  },
];

@NgModule({
  declarations: [AltairComponent, WindowComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule.forRoot(),
    ComponentModule,
    DocViewerModule,
    SchemaFormModule,
    SmartInputModule,
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
    ]),
    // StoreDevtoolsModule.instrument({
    //   logOnly: environment.production,
    // }),
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
  providers: providers,
  bootstrap: [AltairComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [AltairComponent],
})
export class AltairModule {
  constructor(
    applicationInitStatus: ApplicationInitStatus,
    store: Store<RootState>,
    reducerBootstrapper: ReducerBootstrapper
  ) {
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
      ],
    };
  }
}
