import { TestBed, async } from '@angular/core/testing';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StoreModule, Store } from '@ngrx/store';
import * as services from './../../services';
import { Observable } from 'rxjs/Observable';

import { TranslateModule } from '@ngx-translate/core';
import { CodemirrorModule } from 'ng2-codemirror';
import { ClarityModule } from 'clarity-angular';

import { DocViewerModule } from './../../components/doc-viewer/doc-viewer.module';
import { ComponentModule } from './../../components';

import { AppComponent } from './app.component';
import { WindowComponent } from '../window/window.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    const providers = [
      services.ApiService,
      services.GqlService,
      services.DbService,
      services.WindowService,
      services.DonationService,
      services.ElectronAppService,
      services.KeybinderService,
      { provide: services.QueryService, useValue: {
        loadQuery: () => {},
        loadUrl: () => {},
        loadIntrospection: () => {},
      } },
      { provide: Store, useValue: {
        subscribe: () => Observable.empty(),
        select: () => Observable.empty(),
        map: () => Observable.empty(),
        first: () => Observable.empty(),
        dispatch: () => {}
      } }
  ];

    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        WindowComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        StoreModule,
        CodemirrorModule,
        ClarityModule.forRoot(),
        ComponentModule,
        DocViewerModule,
        TranslateModule.forRoot()
      ],
      providers: providers
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
