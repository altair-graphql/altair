import { Observable, of } from 'rxjs';
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

describe('query effects', () => {
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
          useFactory: () => mock(),
        },
        {
          provide: DonationService,
          useFactory: () => mock(),
        },
        {
          provide: ElectronAppService,
          useFactory: () => mock(),
        },
        {
          provide: EnvironmentService,
          useFactory: () => mock(),
        },
        {
          provide: QueryService,
          useFactory: () => mock(),
        },
        {
          provide: NotifyService,
          useFactory: () => mock(),
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

  it('should be created', inject([QueryEffects], (effect: QueryEffects) => {
    expect(effect).toBeTruthy();
  }));
  // let actions$: Observable<Action>;
  // let mockGqlService: GqlService;
  // let mockNotifyService: NotifyService;
  // let mockDbService: DbService;
  // let mockDonationService: DonationService;
  // let mockElectronAppService: ElectronAppService;
  // let mockEnvironmentService: EnvironmentService;
  // let mockQueryService: QueryService;
  // let mockRequestHandlerRegistryService: RequestHandlerRegistryService;
  // let mockApiService: ApiService;
  // let mockStore: Store<RootState>;

  // beforeEach(() => {
  //   actions$ = of({ type: 'Action One' });
  //   mockGqlService = mock();
  //   mockNotifyService = mock();
  //   mockDbService = mock();
  //   mockDonationService = mock();
  //   mockElectronAppService = mock();
  //   mockEnvironmentService = mock();
  //   mockQueryService = mock();
  //   mockRequestHandlerRegistryService = mock();
  //   mockApiService = mock();
  //   mockStore = mockStoreFactory();
  // });
  // describe('.convertToNamedQuery', () => {
  //   it('should dispatch set query action with named query', (done) => {
  //     actions$ = of(new ConvertToNamedQueryAction('window1'));
  //     mockGqlService = mock({
  //       nameQuery() {
  //         return 'query named {}';
  //       },
  //     } as any);
  //     mockStore = mockStoreFactory<RootState>({
  //       windows: {
  //         window1: {
  //           query: {
  //             query: 'query {}',
  //           },
  //         },
  //       },
  //     } as any);
  //     const effects = new QueryEffects(
  //       actions$,
  //       mockGqlService,
  //       mockNotifyService,
  //       mockDbService,
  //       mockDonationService,
  //       mockElectronAppService,
  //       mockEnvironmentService,
  //       mockQueryService,
  //       mockApiService,
  //       mockStore
  //     );

  //     effects.convertToNamedQuery$.subscribe((action) => {
  //       expect(action).toEqual(new SetQueryAction('query named {}', 'window1'));
  //       done();
  //     });
  //   });
  // });
});
