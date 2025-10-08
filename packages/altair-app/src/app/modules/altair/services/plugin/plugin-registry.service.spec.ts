import { inject, TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { PluginRegistryService } from './plugin-registry.service';
import { Store } from '@ngrx/store';
import { mock } from '../../../../../testing';
import { PluginContextService } from './context/plugin-context.service';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { PluginSource } from 'altair-graphql-core/build/plugin/plugin.interfaces';
import { DbService } from '../db.service';
import { NotifyService } from '../notify/notify.service';

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
        pluginSource: PluginSource.NPM,
      });
    });

    it('return pluginSource as npm, if pluginSource is not specified', () => {
      const service: PluginRegistryService = TestBed.inject(PluginRegistryService);
      expect(
        service.getPluginInfoFromString('altair-graphql-plugin-plugin-name@0.0.1')
      ).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: '0.0.1',
        pluginSource: PluginSource.NPM,
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
        pluginSource: PluginSource.GITHUB,
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
        pluginSource: PluginSource.NPM,
        opt: '1',
      } as any);
      expect(
        service.getPluginInfoFromString(
          'url:altair-graphql-plugin-plugin-name@0.0.1::[url]->[http://localhost:8080]'
        )
      ).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: '0.0.1',
        pluginSource: PluginSource.URL,
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
        pluginSource: PluginSource.URL,
      });
    });
  });
});
