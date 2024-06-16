import { TestBed, inject } from '@angular/core/testing';

import { firstValueFrom, empty as observableEmpty } from 'rxjs';

import { StoreModule, Store, provideStore } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import * as services from '../services';
import { WindowService } from './window.service';
import { GqlService } from './gql/gql.service';
import { HttpClientModule } from '@angular/common/http';
import { NotifyService } from './notify/notify.service';
import { MockProvider } from 'ng-mocks';
import { QueryCollectionService } from './query-collection/query-collection.service';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { getReducer } from '../store';

describe('WindowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        WindowService,
        GqlService,
        MockProvider(QueryCollectionService),
        MockProvider(NotifyService),
        MockProvider(services.ElectronAppService),
        services.DbService,
        provideStore(getReducer(), {}),
        // provideMockStore<RootState>({}),
      ],
      teardown: { destroyAfterEach: false },
    });
  });

  it('should ...', inject([WindowService], (service: WindowService) => {
    expect(service).toBeTruthy();
  }));

  describe('newWindow', () => {
    it('should create a new window', inject(
      [WindowService, Store],
      async (service: WindowService, store: Store<RootState>) => {
        const window = await firstValueFrom(service.newWindow());
        expect(window).toEqual({
          title: 'Window 1',
          windowId: expect.any(String),
          url: '',
        });

        const windows = await firstValueFrom(store.select('windows'));
        expect(Object.values(windows)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              layout: { hasDynamicTitle: true, isLoading: false, title: 'Window 1' },
            }),
          ])
        );
      }
    ));
  });
});
