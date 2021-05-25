import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';

import * as services from './../../services';
import { WindowComponent } from './window.component';
import { mock, anyFn, mockStoreFactory } from '../../../../../testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { RootState } from '../../store/state.interfaces';

let mockStore: Store<RootState>;

describe('WindowComponent', () => {
  let component: WindowComponent;
  let fixture: ComponentFixture<WindowComponent>;

  beforeEach(waitForAsync(() => {

    const store = of();
    mockStore = mock<Store<RootState>>(store as any);
    const providers = [
      {
        provide: Store,
        useValue: mockStoreFactory({}),
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
      {
        provide: services.SubscriptionProviderRegistryService,
        useFactory: () => mock<services.SubscriptionProviderRegistryService>({
          getAllProviderData: jest.fn(),
          getAllProviderData$: jest.fn(),
        }),
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
