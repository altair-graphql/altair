import { TestBed, waitForAsync } from '@angular/core/testing';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule, Store } from '@ngrx/store';
import * as services from './../../services';
import { empty as observableEmpty, of } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';


import { AppComponent } from './app.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing/utils';
import { mockStoreFactory, mock } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { AltairConfig } from 'altair-graphql-core/build/config';

describe('AppComponent', () => {
  let wrapper: NgxTestWrapper<AppComponent>;

  beforeEach(async() => {
    const providers = [
      {
        provide: services.WindowService,
        useValue: mock({
          newWindow: () => of(),
        }),
      },
      {
        provide: services.DonationService,
        useValue: mock(),
      },
      {
        provide: services.ElectronAppService,
        useValue: mock({
          connect: () => {},
        }),
      },
      {
        provide: services.KeybinderService,
        useValue: mock({
          connect: () => {},
        }),
      },
      {
        provide: services.PluginRegistryService,
        useValue: mock(),
      },
      {
        provide: services.PluginEventService,
        useValue: mock(),
      },
      {
        provide: services.QueryCollectionService,
        useValue: mock(),
      },
      {
        provide: TranslateService,
        useValue: mock({
          use: () => of(),
          getLangs: () => [],
          setDefaultLang: () => {},
          addLangs: () => {},
          getDefaultLang: () => {},
          getBrowserLang: () => {},
        }),
      },
      {
        provide: AltairConfig,
        useValue: new AltairConfig(),
      },
      {
        provide: Store,
        useValue: mockStoreFactory({
          settings: {}
        }),
      },
  ];
    wrapper = await mount({
      component: AppComponent,
      imports: [
        MockModule(SharedModule),
        MockModule(TranslateModule),
      ],
      providers,
      schemas: [ NO_ERRORS_SCHEMA ],
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });
});
