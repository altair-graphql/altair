import { Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { TestBed } from '@angular/core/testing';
import { QueryEffects } from './query';
import { mock, mockStoreFactory } from '../../testing';
import {
  GqlService,
  NotifyService,
  DbService,
  DonationService,
  EnvironmentService,
  ElectronAppService,
  PreRequestService,
} from 'app/services';
import * as fromRoot from '../store';
import { ConvertToNamedQueryAction, SetQueryAction } from 'app/store/query/query.action';

describe('query effects', () => {
  let actions$: Observable<Action>;
  let mockGqlService: GqlService;
  let mockNotifyService: NotifyService;
  let mockDbService: DbService;
  let mockDonationService: DonationService;
  let mockElectronAppService: ElectronAppService;
  let mockEnvironmentService: EnvironmentService;
  let mockPrerequestService: PreRequestService;
  let mockStore: Store<fromRoot.State>;

  beforeEach(() => {
    actions$ = of({ type: 'Action One' });
    mockGqlService = mock();
    mockNotifyService = mock();
    mockDbService = mock();
    mockDonationService = mock();
    mockElectronAppService = mock();
    mockEnvironmentService = mock();
    mockPrerequestService = mock();
    mockStore = mockStoreFactory();
  });
  describe('.convertToNamedQuery', () => {
    it('should dispatch set query action with named query', (done) => {
      actions$ = of(new ConvertToNamedQueryAction('window1', {}));
      mockGqlService = mock({
        nameQuery() { return 'query named {}' }
      } as any);
      mockStore = mockStoreFactory<fromRoot.State>({
        windows: {
          'window1': {
            query: {
              query: 'query {}'
            }
          }
        }
      } as any);
      const effects = new QueryEffects(
        actions$,
        mockGqlService,
        mockNotifyService,
        mockDbService,
        mockDonationService,
        mockElectronAppService,
        mockEnvironmentService,
        mockPrerequestService,
        mockStore,
      );

      effects.convertToNamedQuery$.subscribe((action) => {
        expect(action).toEqual(new SetQueryAction('query named {}', 'window1'));
        done();
      });
    });
  });
});
