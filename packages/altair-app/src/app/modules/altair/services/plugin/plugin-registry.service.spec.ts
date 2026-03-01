import { inject, TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { PluginRegistryService } from './plugin-registry.service';
import { Store } from '@ngrx/store';
import { mock } from '../../../../../testing';
import { PluginContextService } from './context/plugin-context.service';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { pluginSourceSchema } from 'altair-graphql-core/build/plugin/plugin.schema';
import { DbService } from '../db.service';
import { NotifyService } from '../notify/notify.service';
import { of } from 'rxjs';

let mockHttpClient: HttpClient;
let mockPluginContextService: PluginContextService;
let mockDbService: DbService;
let mockNotifyService: NotifyService;
let mockStore: Store<RootState>;

describe('PluginRegistryService', () => {
  beforeEach(() => {
    mockHttpClient = mock();
    mockStore = mock();
    mockPluginContextService = mock();
    mockDbService = mock();
    mockNotifyService = mock();

    TestBed.configureTestingModule({
      providers: [
        PluginRegistryService,
        {
          provide: HttpClient,
          useFactory: () => mockHttpClient,
        },
        { provide: Store, useFactory: () => mockStore },
        {
          provide: PluginContextService,
          useFactory: () => mockPluginContextService,
        },
        {
          provide: DbService,
          useFactory: () => mockDbService,
        },
        {
          provide: DbService,
          useFactory: () => mockDbService,
        },
        {
          provide: NotifyService,
          useFactory: () => mockNotifyService,
        },
      ],
      teardown: { destroyAfterEach: false },
    });
  });

  it('should be created', () => {
    const service: PluginRegistryService = TestBed.inject(PluginRegistryService);
    expect(service).toBeTruthy();
  });

  describe('.getPluginInfoFromString()', () => {
    it('return undefined for empty string', () => {
      const service: PluginRegistryService = TestBed.inject(PluginRegistryService);
      expect(service.getPluginInfoFromString('')).toBeUndefined();
    });

    it('return undefined if plugin name does not follow specification', () => {
      const service: PluginRegistryService = TestBed.inject(PluginRegistryService);
      expect(service.getPluginInfoFromString('plugin-name')).toBeUndefined();
    });

    it('return version as latest, if version is not specified', () => {
      const service: PluginRegistryService = TestBed.inject(PluginRegistryService);
      expect(
        service.getPluginInfoFromString('altair-graphql-plugin-plugin-name')
      ).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: 'latest',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
    });

    it('return pluginSource as npm, if pluginSource is not specified', () => {
      const service: PluginRegistryService = TestBed.inject(PluginRegistryService);
      expect(
        service.getPluginInfoFromString('altair-graphql-plugin-plugin-name@0.0.1')
      ).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: '0.0.1',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
    });

    it('retrieve plugin info for github plugin', () => {
      const service: PluginRegistryService = TestBed.inject(PluginRegistryService);
      expect(
        service.getPluginInfoFromString(
          'github:altair-graphql-plugin-plugin-name::[repo]->[imolorhe/altair]'
        )
      ).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        pluginSource: pluginSourceSchema.enum.GITHUB,
        version: 'latest',
        repo: 'imolorhe/altair',
      });
    });

    it('return extra option if specified', () => {
      const service: PluginRegistryService = TestBed.inject(PluginRegistryService);
      expect(
        service.getPluginInfoFromString(
          'altair-graphql-plugin-plugin-name@0.0.1::[opt]->[1]'
        )
      ).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: '0.0.1',
        pluginSource: pluginSourceSchema.enum.NPM,
        opt: '1',
      } as any);
      expect(
        service.getPluginInfoFromString(
          'url:altair-graphql-plugin-plugin-name@0.0.1::[url]->[http://localhost:8080]'
        )
      ).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: '0.0.1',
        pluginSource: pluginSourceSchema.enum.URL,
        url: 'http://localhost:8080',
      } as any);
    });

    it('return specified values', () => {
      const service: PluginRegistryService = TestBed.inject(PluginRegistryService);
      expect(
        service.getPluginInfoFromString(
          'url:altair-graphql-plugin-plugin-name@0.1.1'
        )
      ).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: '0.1.1',
        pluginSource: pluginSourceSchema.enum.URL,
      });
    });
  });

  describe('.isUserApprovedPlugin()', () => {
    it('should return false when version is "latest"', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const result = await service.isUserApprovedPlugin({
        name: 'altair-graphql-plugin-test',
        version: 'latest',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
      expect(result).toBe(false);
    });

    it('should return false when no approved map exists in db', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const dbService = TestBed.inject(DbService) as any;
      dbService.getItem = jest.fn().mockReturnValue(of(undefined));

      const result = await service.isUserApprovedPlugin({
        name: 'altair-graphql-plugin-test',
        version: '1.0.0',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
      expect(result).toBe(false);
    });

    it('should return false when plugin source not in approved map', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const dbService = TestBed.inject(DbService) as any;
      dbService.getItem = jest.fn().mockReturnValue(of({}));

      const result = await service.isUserApprovedPlugin({
        name: 'altair-graphql-plugin-test',
        version: '1.0.0',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
      expect(result).toBe(false);
    });

    it('should return false when plugin name not in approved map', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const dbService = TestBed.inject(DbService) as any;
      dbService.getItem = jest.fn().mockReturnValue(of({ npm: {} }));

      const result = await service.isUserApprovedPlugin({
        name: 'altair-graphql-plugin-test',
        version: '1.0.0',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
      expect(result).toBe(false);
    });

    it('should return true when version is in approved map', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const dbService = TestBed.inject(DbService) as any;
      dbService.getItem = jest
        .fn()
        .mockReturnValue(of({ npm: { 'altair-graphql-plugin-test': ['1.0.0'] } }));

      const result = await service.isUserApprovedPlugin({
        name: 'altair-graphql-plugin-test',
        version: '1.0.0',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
      expect(result).toBe(true);
    });

    it('should return false when version is not in approved list', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const dbService = TestBed.inject(DbService) as any;
      dbService.getItem = jest
        .fn()
        .mockReturnValue(of({ npm: { 'altair-graphql-plugin-test': ['2.0.0'] } }));

      const result = await service.isUserApprovedPlugin({
        name: 'altair-graphql-plugin-test',
        version: '1.0.0',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
      expect(result).toBe(false);
    });
  });

  describe('.addPluginToApprovedMap()', () => {
    it('should return early without calling db.setItem for version "latest"', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const dbService = TestBed.inject(DbService) as any;
      dbService.getItem = jest.fn().mockReturnValue(of(undefined));
      dbService.setItem = jest.fn().mockReturnValue(of(undefined));

      await service.addPluginToApprovedMap({
        name: 'altair-graphql-plugin-test',
        version: 'latest',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
      expect(dbService.setItem).not.toHaveBeenCalled();
    });

    it('should create new approved map entry when db has no existing map', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const dbService = TestBed.inject(DbService) as any;
      dbService.getItem = jest.fn().mockReturnValue(of(undefined));
      dbService.setItem = jest.fn().mockReturnValue(of(undefined));

      await service.addPluginToApprovedMap({
        name: 'altair-graphql-plugin-test',
        version: '1.0.0',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
      expect(dbService.setItem).toHaveBeenCalledWith('__user_plugin_approved_map', {
        npm: { 'altair-graphql-plugin-test': ['1.0.0'] },
      });
    });

    it('should append to existing approved map', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const dbService = TestBed.inject(DbService) as any;
      dbService.getItem = jest
        .fn()
        .mockReturnValue(of({ npm: { 'altair-graphql-plugin-test': ['0.9.0'] } }));
      dbService.setItem = jest.fn().mockReturnValue(of(undefined));

      await service.addPluginToApprovedMap({
        name: 'altair-graphql-plugin-test',
        version: '1.0.0',
        pluginSource: pluginSourceSchema.enum.NPM,
      });
      expect(dbService.setItem).toHaveBeenCalledWith('__user_plugin_approved_map', {
        npm: { 'altair-graphql-plugin-test': ['0.9.0', '1.0.0'] },
      });
    });
  });

  describe('.isPluginInSettings()', () => {
    it('should return false when plugin.list is absent in settings', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const store = TestBed.inject(Store) as any;
      store.select = jest.fn().mockReturnValue(of({}));

      const result = await service.isPluginInSettings('altair-graphql-plugin-test');
      expect(result).toBe(false);
    });

    it('should return true when plugin name is in settings list', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const store = TestBed.inject(Store) as any;
      store.select = jest
        .fn()
        .mockReturnValue(
          of({ 'plugin.list': ['altair-graphql-plugin-test@1.0.0'] })
        );

      const result = await service.isPluginInSettings('altair-graphql-plugin-test');
      expect(result).toBe(true);
    });

    it('should return false when plugin name is not in settings list', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const store = TestBed.inject(Store) as any;
      store.select = jest
        .fn()
        .mockReturnValue(
          of({ 'plugin.list': ['altair-graphql-plugin-other@1.0.0'] })
        );

      const result = await service.isPluginInSettings('altair-graphql-plugin-test');
      expect(result).toBe(false);
    });
  });

  describe('.addPluginToSettings()', () => {
    it('should dispatch SetSettingsJsonAction with plugin appended to list', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const store = TestBed.inject(Store) as any;
      store.select = jest.fn().mockReturnValue(of({ 'plugin.list': [] }));
      store.dispatch = jest.fn();

      await service.addPluginToSettings('altair-graphql-plugin-test@1.0.0');
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_SETTINGS_JSON' })
      );
    });

    it('should initialize plugin.list if absent', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const store = TestBed.inject(Store) as any;
      store.select = jest.fn().mockReturnValue(of({}));
      store.dispatch = jest.fn();

      await service.addPluginToSettings('altair-graphql-plugin-test@1.0.0');
      expect(store.dispatch).toHaveBeenCalled();
      const dispatched = (store.dispatch as jest.Mock).mock.calls[0][0];
      const value = JSON.parse(dispatched.payload.value);
      expect(value['plugin.list']).toContain('altair-graphql-plugin-test@1.0.0');
    });
  });

  describe('.removePluginFromSettings()', () => {
    it('should dispatch SetSettingsJsonAction with plugin removed from list', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const store = TestBed.inject(Store) as any;
      store.select = jest.fn().mockReturnValue(
        of({
          'plugin.list': [
            'altair-graphql-plugin-test@1.0.0',
            'altair-graphql-plugin-other@1.0.0',
          ],
        })
      );
      store.dispatch = jest.fn();

      await service.removePluginFromSettings('altair-graphql-plugin-test');
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_SETTINGS_JSON' })
      );
      const dispatched = (store.dispatch as jest.Mock).mock.calls[0][0];
      const value = JSON.parse(dispatched.payload.value);
      expect(value['plugin.list']).not.toContain('altair-graphql-plugin-test@1.0.0');
    });
  });

  describe('.installedPlugins()', () => {
    it('should return an observable from the store', () => {
      const service = TestBed.inject(PluginRegistryService);
      const store = TestBed.inject(Store) as any;
      store.select = jest.fn().mockReturnValue(of([]));

      const result = service.installedPlugins();
      expect(result).toBeTruthy();
    });
  });

  describe('.pluginsReady()', () => {
    it('should resolve immediately when no plugins have been fetched', async () => {
      const service = TestBed.inject(PluginRegistryService);
      const result = await service.pluginsReady();
      expect(result).toEqual([]);
    });
  });
});
