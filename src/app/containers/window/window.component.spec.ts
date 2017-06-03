import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StoreModule, Store } from '@ngrx/store';
import * as services from './../../services';

import { CodemirrorModule } from 'ng2-codemirror';

import { DocViewerModule } from './../../components/doc-viewer/doc-viewer.module';
import { ComponentModule } from './../../components';

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
        subscribe: () => {}
      } }
    ];
    TestBed.configureTestingModule({
      declarations: [ WindowComponent ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        StoreModule,
        CodemirrorModule,
        ComponentModule,
        DocViewerModule
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
