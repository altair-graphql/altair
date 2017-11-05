import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ToastModule, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { appReducer } from './reducers';

import { QueryEffects } from './effects/query';

import { ComponentModule } from './components';
import { DocViewerModule } from './components/doc-viewer/doc-viewer.module';

import { AppComponent } from './containers/app/app.component';
import { WindowComponent } from './containers/window/window.component';

import { CustomOption } from './services/notify/toastr-options';

import * as services from './services';

export function mapValuesToArray(obj: any): Array<any> {
    return Object.keys(obj).map(function(key){
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
    { provide: ToastOptions, useClass: CustomOption }
];

@NgModule({
  declarations: [
    AppComponent,
    WindowComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentModule,
    DocViewerModule,
    StoreModule.provideStore(appReducer),
    EffectsModule.run(QueryEffects),
    StoreDevtoolsModule.instrumentOnlyWithExtension(),
    ToastModule.forRoot()
  ],
  providers: providers,
  bootstrap: [AppComponent]
})
export class AppModule { }
