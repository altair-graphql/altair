import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';

import * as services from './../../services';
import { WindowComponent } from './window.component';
import { mock, anyFn } from '../../../testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import * as fromRoot from '../../store';

let mockStore: Store<fromRoot.State>;

describe('WindowComponent', () => {
  let component: WindowComponent;
  let fixture: ComponentFixture<WindowComponent>;

  beforeEach(async(() => {

    const store = of();
    mockStore = mock<Store<fromRoot.State>>(store as any);
    const providers = [
      {
        provide: Store,
        useFactory: () => mockStore,
      },
      {
        provide: services.GqlService,
        useFactory: () => mock(),
      },
      {
        provide: services.NotifyService,
        useFactory: () => mock(),
      },
      {
        provide: services.WindowService,
        useFactory: () => mock({
          setupWindow: anyFn(),
        }),
      },
      {
        provide: services.PluginRegistryService,
        useFactory: () => mock(),
      },
    ];
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      declarations: [ WindowComponent ],
      providers: providers,
      schemas: [ NO_ERRORS_SCHEMA ]
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
