import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule, Store } from '@ngrx/store';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { ClarityModule } from 'clarity-angular';

import * as services from './../../services';

import { CodemirrorModule } from 'ng2-codemirror';

import { DocViewerModule } from './../../components/doc-viewer/doc-viewer.module';
import { ComponentModule } from './../../components';

import { TranslateModule } from '@ngx-translate/core';
import { WindowComponent } from './window.component';

describe('WindowComponent', () => {
  let component: WindowComponent;
  let fixture: ComponentFixture<WindowComponent>;

  beforeEach(async(() => {
    const providers = [
      services.ApiService,
      services.GqlService,
      services.DbService,
      { provide: services.QueryService, useValue: {
        loadQuery: () => {},
        loadUrl: () => {},
        loadIntrospection: () => {},
      } },
      { provide: Store, useValue: {
        subscribe: () => {},
        select: () => ({ select: () => {}}),
        map: () => Observable.empty(),
        dispatch: () => {}
      } },
      services.NotifyService
    ];
    TestBed.configureTestingModule({
      declarations: [ WindowComponent ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        StoreModule,
        CodemirrorModule,
        ClarityModule.forRoot(),
        ComponentModule,
        DocViewerModule,
        ToastModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: providers
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
