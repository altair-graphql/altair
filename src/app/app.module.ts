import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { reducer } from './reducers';

import { QueryEffects } from './effects/query';

import { ComponentModule } from './components';
import { DocViewerModule } from './components/doc-viewer/doc-viewer.module';

import { AppComponent } from './containers/app/app.component';

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
    services.QueryService
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ComponentModule,
    DocViewerModule,
    StoreModule.provideStore(reducer),
    EffectsModule.run(QueryEffects),
    StoreDevtoolsModule.instrumentOnlyWithExtension()
  ],
  providers: providers,
  bootstrap: [AppComponent]
})
export class AppModule { }
