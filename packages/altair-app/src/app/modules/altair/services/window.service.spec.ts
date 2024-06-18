import { TestBed, inject } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { Store, provideStore } from '@ngrx/store';

import * as services from '../services';
import { WindowService } from './window.service';
import { GqlService } from './gql/gql.service';
import { HttpClientModule } from '@angular/common/http';
import { NotifyService } from './notify/notify.service';
import { MockProvider } from 'ng-mocks';
import { QueryCollectionService } from './query-collection/query-collection.service';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { getReducer } from '../store';
import { ExportWindowState } from 'altair-graphql-core/build/types/state/window.interfaces';

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

  describe('removeWindow', () => {
    it('should remove the window', inject(
      [WindowService, Store],
      async (service: WindowService, store: Store<RootState>) => {
        const window = await firstValueFrom(service.newWindow());
        await firstValueFrom(service.removeWindow(window.windowId));

        const windows = await firstValueFrom(store.select('windows'));
        expect(Object.values(windows)).toHaveLength(0);
      }
    ));
  });

  describe('importWindowData', () => {
    it('should import the window data into the store', inject(
      [WindowService, Store],
      async (service: WindowService, store: Store<RootState>) => {
        const windowData: ExportWindowState = {
          type: 'window',
          version: 1,
          apiUrl: 'http://localhost:3000',
          windowName: 'Window 1',
          query: '{ hello }',
          headers: [],
          subscriptionUrl: 'ws://localhost:3000',
          variables: '{}',
        };
        await service.importWindowData(windowData);

        const windows = await firstValueFrom(store.select('windows'));
        expect(Object.values(windows)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              layout: {
                hasDynamicTitle: false,
                isLoading: false,
                title: 'Window 1',
              },
              query: expect.objectContaining({
                httpVerb: 'POST',
                query: '{ hello }',
                requestExtensions: '',
                requestHandlerAdditionalParams: '{}',
                requestHandlerId: 'http',
                responses: [],
                selectedOperation: null,
                subscriptionConnectionParams: '{}',
                subscriptionProviderId: 'websocket',
                subscriptionUrl: 'ws://localhost:3000',
                subscriptionUseDefaultRequestHandler: false,
                url: 'http://localhost:3000',
              }),
            }),
          ])
        );
      }
    ));
  });

  describe('duplicateWindow', () => {
    it('should duplicate the window', inject(
      [WindowService, Store],
      async (service: WindowService, store: Store<RootState>) => {
        const windowData: ExportWindowState = {
          type: 'window',
          version: 1,
          apiUrl: 'http://localhost:3000',
          windowName: 'Window 1',
          query: '{ hello }',
          headers: [],
          subscriptionUrl: 'ws://localhost:3000',
          variables: '{}',
        };
        await service.importWindowData(windowData);

        const windows = await firstValueFrom(store.select('windows'));
        const window = Object.values(windows)[0];
        await firstValueFrom(service.duplicateWindow(window?.windowId ?? ''));

        const newWindows = await firstValueFrom(store.select('windows'));
        expect(Object.values(newWindows)).toHaveLength(2);
        expect(Object.values(newWindows)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              layout: {
                hasDynamicTitle: false,
                isLoading: false,
                title: 'Window 1 (Copy)',
              },
              query: expect.objectContaining({
                httpVerb: 'POST',
                query: '{ hello }',
                requestExtensions: '',
                requestHandlerAdditionalParams: '{}',
                requestHandlerId: 'http',
                responses: [],
                selectedOperation: null,
                subscriptionConnectionParams: '{}',
                subscriptionProviderId: 'websocket',
                subscriptionUrl: 'ws://localhost:3000',
                subscriptionUseDefaultRequestHandler: false,
                url: 'http://localhost:3000',
              }),
            }),
          ])
        );
      }
    ));
  });

  describe('updateWindowState', () => {
    it('should update the window state', inject(
      [WindowService, Store],
      async (service: WindowService, store: Store<RootState>) => {
        const windowData: ExportWindowState = {
          type: 'window',
          version: 1,
          apiUrl: 'http://localhost:3000',
          windowName: 'Window 1',
          query: '{ hello }',
          headers: [],
          subscriptionUrl: 'ws://localhost:3000',
          variables: '{}',
        };
        await service.importWindowData(windowData);

        const windows = await firstValueFrom(store.select('windows'));
        const window = Object.values(windows)[0];
        await service.updateWindowState(window?.windowId ?? '', {
          type: 'window',
          version: 1,
          apiUrl: 'http://localhost:3001',
          windowName: 'My fav window',
          query: '{ bye }',
          headers: [{ key: 'x1', value: 'y1' }],
          subscriptionUrl: 'ws://localhost:3001',
          variables: '{"x": "y"}',
        });

        const newWindows = await firstValueFrom(store.select('windows'));
        expect(Object.values(newWindows)).toHaveLength(1);
        expect(Object.values(newWindows)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              layout: {
                hasDynamicTitle: false,
                isLoading: false,
                title: 'My fav window',
              },
              query: expect.objectContaining({
                httpVerb: 'POST',
                query: '{ bye }',
                requestExtensions: '',
                requestHandlerAdditionalParams: '{}',
                requestHandlerId: 'http',
                responses: [],
                selectedOperation: null,
                subscriptionConnectionParams: '{}',
                subscriptionProviderId: 'websocket',
                subscriptionUrl: 'ws://localhost:3001',
                subscriptionUseDefaultRequestHandler: false,
                url: 'http://localhost:3001',
              }),
            }),
          ])
        );
      }
    ));
  });

  describe('importStringData', () => {
    it('should import the string data into the store', inject(
      [WindowService, Store],
      async (service: WindowService, store: Store<RootState>) => {
        const windowData = JSON.stringify({
          type: 'window',
          version: 1,
          apiUrl: 'http://localhost:3000',
          windowName: 'Window 1',
          query: '{ hello }',
          headers: [],
          subscriptionUrl: 'ws://localhost:3000',
          variables: '{}',
        });
        await service.importStringData(windowData);

        const windows = await firstValueFrom(store.select('windows'));
        expect(Object.values(windows)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              layout: {
                hasDynamicTitle: false,
                isLoading: false,
                title: 'Window 1',
              },
              query: expect.objectContaining({
                httpVerb: 'POST',
                query: '{ hello }',
                requestExtensions: '',
                requestHandlerAdditionalParams: '{}',
                requestHandlerId: 'http',
                responses: [],
                selectedOperation: null,
                subscriptionConnectionParams: '{}',
                subscriptionProviderId: 'websocket',
                subscriptionUrl: 'ws://localhost:3000',
                subscriptionUseDefaultRequestHandler: false,
                url: 'http://localhost:3000',
              }),
            }),
          ])
        );
      }
    ));
  });
});
