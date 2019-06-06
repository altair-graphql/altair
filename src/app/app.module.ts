import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import '@clr/icons';
import '@clr/icons/shapes/all-shapes';

import { ToastrModule } from 'ngx-toastr';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ClarityModule } from '@clr/angular';
import { SortablejsModule } from 'angular-sortablejs';
import { SharedModule } from './shared/shared.module';

import { reducer, metaReducers, reducerToken, reducerProvider } from './reducers';

import { QueryEffects } from './effects/query';
import { WindowsEffects } from './effects/windows';
import { QueryCollectionEffects } from './effects/query-collection';

import { DirectivesModule } from './directives';
import { ComponentModule } from './components';
import { DocViewerModule } from './components/doc-viewer/doc-viewer.module';
import { SmartInputModule } from './components/smart-input/smart-input.module';

import { AppComponent } from './containers/app/app.component';
import { WindowComponent } from './containers/window/window.component';


import * as services from './services';

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
    services.PreRequestService,
    reducerProvider,
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
    ClarityModule,
    SortablejsModule.forRoot({ animation: 150 }),
    ComponentModule,
    DocViewerModule,
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
