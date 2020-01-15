import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ToastrModule } from 'ngx-toastr';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { SortablejsModule } from 'ngx-sortablejs';
import { CookieService } from 'ngx-cookie-service';
import { SharedModule } from './modules/shared/shared.module';

import { metaReducers, reducerToken } from './reducers';

import { QueryEffects } from './effects/query';
import { WindowsEffects } from './effects/windows';
import { QueryCollectionEffects } from './effects/query-collection';

import { DirectivesModule } from './directives';
import { ComponentModule } from './components/components.module';
import { DocViewerModule } from './components/doc-viewer/doc-viewer.module';
import { SmartInputModule } from './components/smart-input/smart-input.module';
import { SchemaFormModule } from './components/schema-form/schema-form.module';

import { AppComponent } from './containers/app/app.component';
import { WindowComponent } from './containers/window/window.component';


import * as services from './services';
import { HTTPErrorInterceptor } from './interceptors/http-error.interceptor';
import { GlobalErrorHandler } from './error-handler';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AppOverlayContainer } from './overlay-container';
import { PluginPropsFactory } from './services/plugin/plugin-props-factory';

registerLocaleData(en);

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  // Using relative path to the translation files to ensure cross platform compatibility (majorly because of the electron apps)
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function mapValuesToArray(obj: any): Array<any> {
    return Object.keys(obj).map(function(key) {
        return obj[key];
    });
};

const servicesArray: Array<any> = mapValuesToArray(services);

const providers = [
  services.ApiService,
  services.GqlService,
  services.DbService,
  services.QueryService,
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
  PluginPropsFactory,
  services.PreRequestService,
  // Setting the reducer provider in main.ts now (for proper config initialization)
  // reducerProvider,
  CookieService,
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
  }
];

@NgModule({
  declarations: [
    AppComponent,
    WindowComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    SharedModule.forRoot(),
    SortablejsModule.forRoot({ animation: 150 }),
    ComponentModule,
    DocViewerModule,
    SchemaFormModule,
    SmartInputModule,
    DirectivesModule,
    StoreModule.forRoot(reducerToken, { metaReducers }),
    EffectsModule.forRoot([ QueryEffects, WindowsEffects, QueryCollectionEffects ]),
    StoreDevtoolsModule.instrument(),
    ToastrModule.forRoot({
      newestOnTop: false,
      closeButton: true,
      positionClass: 'toast-top-center',
      enableHtml: true,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [ HttpClient ]
      }
    }),
  ],
  providers: providers,
  bootstrap: [ AppComponent ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
