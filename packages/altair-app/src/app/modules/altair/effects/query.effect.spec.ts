import { Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { TestBed } from '@angular/core/testing';
import { QueryEffects } from './query.effect';
import { mock, mockStoreFactory } from '../../../../testing';
import {
  GqlService,
  NotifyService,
  DbService,
  DonationService,
  EnvironmentService,
  ElectronAppService,
  SubscriptionProviderRegistryService,
  QueryService,
  ApiService,
} from '../services';
import * as fromRoot from '../store';
import {
  ConvertToNamedQueryAction,
  SetQueryAction,
} from '../store/query/query.action';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

describe('query effects', () => {
  let actions$: Observable<Action>;
  let mockGqlService: GqlService;
  let mockNotifyService: NotifyService;
  let mockDbService: DbService;
  let mockDonationService: DonationService;
  let mockElectronAppService: ElectronAppService;
  let mockEnvironmentService: EnvironmentService;
  let mockQueryService: QueryService;
  let mockSubscriptionProviderRegistryService: SubscriptionProviderRegistryService;
  let mockApiService: ApiService;
  let mockStore: Store<RootState>;

  beforeEach(() => {
    actions$ = of({ type: 'Action One' });
    mockGqlService = mock();
    mockNotifyService = mock();
    mockDbService = mock();
    mockDonationService = mock();
    mockElectronAppService = mock();
    mockEnvironmentService = mock();
    mockQueryService = mock();
    mockSubscriptionProviderRegistryService = mock();
    mockApiService = mock();
    mockStore = mockStoreFactory();
  });
  describe('.convertToNamedQuery', () => {
    it('should dispatch set query action with named query', (done) => {
      actions$ = of(new ConvertToNamedQueryAction('window1'));
      mockGqlService = mock({
        nameQuery() {
          return 'query named {}';
        },
      } as any);
      mockStore = mockStoreFactory<RootState>({
        windows: {
          window1: {
            query: {
              query: 'query {}',
            },
          },
        },
      } as any);
      const effects = new QueryEffects(
        actions$,
        mockGqlService,
        mockNotifyService,
        mockDbService,
        mockDonationService,
        mockElectronAppService,
        mockEnvironmentService,
        mockQueryService,
        mockSubscriptionProviderRegistryService,
        mockApiService,
        mockStore
      );

      effects.convertToNamedQuery$.subscribe((action) => {
        expect(action).toEqual(new SetQueryAction('query named {}', 'window1'));
        done();
      });
    });
  });
});
