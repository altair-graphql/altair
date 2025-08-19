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
  let actions$: Observable<Action>;
  let mockGqlService: GqlService;
  let mockNotifyService: NotifyService;
  let mockDbService: DbService;
  let mockDonationService: DonationService;
  let mockElectronAppService: ElectronAppService;
  let mockEnvironmentService: EnvironmentService;
  let mockQueryService: QueryService;
  let mockRequestHandlerRegistryService: RequestHandlerRegistryService;
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
    mockRequestHandlerRegistryService = mock();
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
        mockApiService,
        mockStore
      );

      effects.convertToNamedQuery$.subscribe((action) => {
        expect(action).toEqual(new SetQueryAction('query named {}', 'window1'));
        done();
      });
    });
  });

  describe('.sendQueryRequest', () => {
    it('should use QueryService validation and preparation methods', (done) => {
      const mockQueryService = {
        ...mockQueryService,
        validateQueryRequest: jest.fn().mockReturnValue({ isValid: true }),
        prepareQueryExecution: jest.fn().mockReturnValue({
          shouldContinue: false,
          isSubscriptionQuery: false,
        }),
        prepareQueryRequestData: jest.fn().mockResolvedValue({
          url: 'http://test.com',
          variables: '{}',
          query: 'query { test }',
          headers: [],
          extensions: '',
          subscriptionUrl: '',
          subscriptionConnectionParams: '',
          requestHandlerAdditionalParams: '',
          preRequestScriptLogs: [],
          handler: {},
        }),
      };

      actions$ = of({
        type: 'SEND_QUERY_REQUEST',
        windowId: 'window1',
      } as any);

      mockStore = mockStoreFactory<RootState>({
        windows: {
          window1: {
            query: {
              query: 'query { test }',
            },
            variables: {
              files: [],
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
        mockApiService,
        mockStore
      );

      // Since this is a side effect, we just need to verify it doesn't throw
      // The actual request logic is tested in integration tests
      effects.sendQueryRequest$.subscribe({
        complete: () => {
          // Verify the service methods were called
          expect(mockQueryService.prepareQueryExecution).toHaveBeenCalled();
          expect(mockQueryService.prepareQueryRequestData).toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });
  });
});
