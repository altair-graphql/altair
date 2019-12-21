import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule, Store, Action } from '@ngrx/store';
import { ToastrModule } from 'ngx-toastr';

import * as services from './../../services';
import { reducer, reducerToken, reducerProvider, State } from '../../reducers';

import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { DocViewerModule } from './../../components/doc-viewer/doc-viewer.module';
import { ComponentModule } from './../../components';

import { TranslateModule } from '@ngx-translate/core';
import { WindowComponent } from './window.component';

import { mockState } from './mock_state';
import { Subject } from 'rxjs/Subject';

function mockStore<T>({
  actions = new Subject<Action>(),
  states = new Subject<T>()
}: {
  actions?: Subject<Action>,
  states?: Subject<T>
}): Store<T> {
  const source = Observable.interval(1000).map(() => 1);
  const result = states as any;
  result.select = () => result;
  result.dispatch = (action: Action) => actions.next(action);
  source.subscribe(result);
  return result;
}
const _actions = new Subject<Action>();
const _states = new Subject<State>();
const store = mockStore<State>({ actions: _actions, states: _states });

describe('WindowComponent', () => {
  let component: WindowComponent;
  let fixture: ComponentFixture<WindowComponent>;

  beforeEach(async(() => {
    const obs: any = Observable.empty();
    obs.select = () => obs;
    obs.subscribe = () => obs;
    obs.map = () => obs;
    obs.dispatch = () => obs;
    // obs.unsubscribe = () => obs;

    const providers = [
      services.ApiService,
      services.GqlService,
      services.DbService,
      { provide: services.QueryService, useValue: {
        loadQuery: () => {},
        loadUrl: () => {},
        loadIntrospection: () => {},
      } },
      { provide: Store, useValue: store },
      services.NotifyService,
      // reducerProvider
    ];
    TestBed.configureTestingModule({
      declarations: [ WindowComponent ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        StoreModule.forRoot(reducer, { initialState: <any>mockState }),
        CodemirrorModule,
        ComponentModule,
        DocViewerModule,
        ToastrModule.forRoot(),
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
