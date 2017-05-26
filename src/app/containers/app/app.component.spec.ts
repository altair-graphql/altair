import { TestBed, async } from '@angular/core/testing';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import * as services from './services';
import { Store } from './store';


import { CodemirrorModule } from 'ng2-codemirror';

import { DocViewerModule } from './doc-viewer/doc-viewer.module';

import { QueryEditorComponent } from './query-editor/query-editor.component';
import { QueryResultComponent } from './query-result/query-result.component';
import { KeysPipe } from './keys.pipe';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { SetVariableDialogComponent } from './set-variable-dialog/set-variable-dialog.component';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    const providers = [
      Store,
      services.ApiService,
      services.GqlService,
      services.StoreHelper
  ];

    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        QueryEditorComponent,
        QueryResultComponent,
        KeysPipe,
        ActionBarComponent,
        SetVariableDialogComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        CodemirrorModule,
        DocViewerModule
      ],
      providers: providers
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  // it(`should have as title 'app works!'`, async(() => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.debugElement.componentInstance;
  //   expect(app.title).toEqual('app works!');
  // }));

  // it('should render title in a h1 tag', async(() => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain('app works!');
  // }));
});
