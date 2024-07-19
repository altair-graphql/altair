import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import * as services from './../../services';
import { of } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AltairComponent } from './altair.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing/utils';
import { mockStoreFactory, mock } from '../../../../../testing';
import { MockModule, MockProvider } from 'ng-mocks';
import { AltairConfig } from 'altair-graphql-core/build/config';

describe('AltairComponent', () => {
  let wrapper: NgxTestWrapper<AltairComponent>;

  beforeEach(async () => {
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
      MockProvider(services.PluginRegistryService, {
        async isPluginInSettings() {
          return false;
        },
      }),
      {
        provide: services.PluginEventService,
        useValue: mock(),
      },
      {
        provide: services.QueryCollectionService,
        useValue: mock(),
      },
      {
        provide: services.NotifyService,
        useValue: mock(),
      },
      {
        provide: services.FilesService,
        useValue: mock(),
      },
      {
        provide: services.EnvironmentService,
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
          settings: {},
          account: {},
          windowsMeta: {},
        }),
      },
      MockProvider(services.DbService, {
        getItem(key) {
          return of(false);
        },
      }),
      MockProvider(services.BannerService),
    ];
    wrapper = await mount({
      component: AltairComponent,
      imports: [MockModule(SharedModule), MockModule(TranslateModule)],
      providers,
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });
});
