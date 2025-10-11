import { firstValueFrom, Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { inject, TestBed } from '@angular/core/testing';
import { QueryEffects } from './query.effect';
import { mock, mockStoreFactory } from '../../../../testing';
import {
  GqlService,
  NotifyService,
  DbService,
  DonationService,
  EnvironmentService,
  ElectronAppService,
  QueryService,
  ApiService,
  RequestHandlerRegistryService,
} from '../services';
import * as fromRoot from '../store';
import {
  ConvertToNamedQueryAction,
  SetQueryAction,
} from '../store/query/query.action';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { Actions } from '@ngrx/effects';

describe('query effects', () => {
  let mockGqlService: GqlService;
  let mockNotifyService: NotifyService;
  let mockDonationService: DonationService;
  let mockElectronAppService: ElectronAppService;
  let mockEnvironmentService: EnvironmentService;
  let mockQueryService: QueryService;

  beforeEach(() => {
    mockGqlService = mock();
    mockNotifyService = mock();
    mockDonationService = mock();
    mockElectronAppService = mock();
    mockEnvironmentService = mock();
    mockQueryService = mock();
  });
  beforeEach(() =>
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false },
      imports: [],
      providers: [
        QueryEffects,
        provideMockActions(() => of({ type: 'Action One' })),
        DbService,
        {
          provide: GqlService,
          useFactory: () => mockGqlService,
        },
        {
          provide: DonationService,
          useFactory: () => mockDonationService,
        },
        {
          provide: ElectronAppService,
          useFactory: () => mockElectronAppService,
        },
        {
          provide: EnvironmentService,
          useFactory: () => mockEnvironmentService,
        },
        {
          provide: QueryService,
          useFactory: () => mockQueryService,
        },
        {
          provide: NotifyService,
          useFactory: () => mockNotifyService,
        },
        {
          provide: Store,
          useFactory: () =>
            mockStoreFactory({
              settings: {
                'beta.disable.newScript': true,
              },
            }),
        },
        // provideHttpClient(withInterceptorsFromDi()),
      ],
    })
  );

  it('should be created', inject([QueryEffects], (effects: QueryEffects) => {
    expect(effects).toBeTruthy();
  }));
  describe('.convertToNamedQuery', () => {
    it('should dispatch set query action with named query', async () => {
      TestBed.overrideProvider(Store, {
        useFactory: () =>
          mockStoreFactory<RootState>({
            windows: {
              window1: {
                query: {
                  query: 'query {}',
                },
              },
            },
          } as any),
      });
      TestBed.overrideProvider(Actions, {
        useFactory: () => of(new ConvertToNamedQueryAction('window1')),
      });
      TestBed.overrideProvider(GqlService, {
        useFactory: () =>
          mock({
            nameQuery() {
              return 'query named {}';
            },
          } as any),
      });
      const effects = TestBed.inject(QueryEffects);

      const action = await firstValueFrom(effects.convertToNamedQuery$);
      expect(action).toEqual(new SetQueryAction('query named {}', 'window1'));
    });
  });
});
