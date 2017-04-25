import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import * as services from './services';
import { Store } from './store';
import { QueryEditorComponent } from './query-editor/query-editor.component';
import { QueryResultComponent } from './query-result/query-result.component';
import { DocViewerComponent } from './doc-viewer/doc-viewer.component';
import { KeysPipe } from './keys.pipe';

export function mapValuesToArray(obj: any): Array<any> {
    return Object.keys(obj).map(function(key){
        return obj[key];
    });
};

const servicesArray: Array<any> = mapValuesToArray(services);

const providers = [
    Store,
    services.ApiService,
    services.GqlService,
    services.StoreHelper
];

@NgModule({
  declarations: [
    AppComponent,
    QueryEditorComponent,
    QueryResultComponent,
    DocViewerComponent,
    KeysPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: providers,
  bootstrap: [AppComponent]
})
export class AppModule { }
