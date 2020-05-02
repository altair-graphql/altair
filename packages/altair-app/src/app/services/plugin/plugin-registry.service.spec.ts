import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { PluginRegistryService } from './plugin-registry.service';
import { PluginPropsFactory } from './plugin-props-factory';
import { Store } from '@ngrx/store';
import { empty as observableEmpty } from 'rxjs';
import { WindowService } from '../window.service';
import { GqlService } from '../gql/gql.service';
import { NotifyService } from '../notify/notify.service';
import { ToastrModule } from 'ngx-toastr';
import { PluginSource } from './plugin';

describe('PluginRegistryService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientModule,
      ToastrModule.forRoot()
    ],
    providers: [
      PluginRegistryService,
      PluginPropsFactory,
      WindowService,
      GqlService,
      NotifyService,
      { provide: Store, useValue: {
        subscribe: () => observableEmpty(),
        select: () => observableEmpty(),
        map: () => observableEmpty(),
        first: () => observableEmpty(),
        pipe: () => observableEmpty(),
        dispatch: () => {}
      } },
    ]
  }));

  it('should be created', () => {
    const service: PluginRegistryService = TestBed.get(PluginRegistryService);
    expect(service).toBeTruthy();
  });

  describe('.getPluginInfoFromString()', () => {
    it('return null for empty string', () => {
      const service: PluginRegistryService = TestBed.get(PluginRegistryService);
      expect(service.getPluginInfoFromString('')).toBeNull();
    });

    it('should throw error if plugin name does not follow specification', () => {
      const service: PluginRegistryService = TestBed.get(PluginRegistryService);
      expect(() => service.getPluginInfoFromString('plugin-name')).toThrow();
    });

    it('return version as latest, if version is not specified', () => {
      const service: PluginRegistryService = TestBed.get(PluginRegistryService);
      expect(service.getPluginInfoFromString('altair-graphql-plugin-plugin-name')).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: 'latest',
        pluginSource: PluginSource.NPM,
      });
    });

    it('return pluginSource as npm, if pluginSource is not specified', () => {
      const service: PluginRegistryService = TestBed.get(PluginRegistryService);
      expect(service.getPluginInfoFromString('altair-graphql-plugin-plugin-name@0.0.1')).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: '0.0.1',
        pluginSource: PluginSource.NPM,
      });
    });

    it('return extra option if specified', () => {
      const service: PluginRegistryService = TestBed.get(PluginRegistryService);
      expect(service.getPluginInfoFromString('altair-graphql-plugin-plugin-name@0.0.1::[opt]->[1]')).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: '0.0.1',
        pluginSource: PluginSource.NPM,
        opt: '1',
      } as any);
      expect(service.getPluginInfoFromString('url:altair-graphql-plugin-plugin-name@0.0.1::[url]->[http://localhost:8080]')).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: '0.0.1',
        pluginSource: PluginSource.URL,
        url: 'http://localhost:8080',
      } as any);
    });

    it('return specified values', () => {
      const service: PluginRegistryService = TestBed.get(PluginRegistryService);
      expect(service.getPluginInfoFromString('url:altair-graphql-plugin-plugin-name@0.1.1')).toEqual({
        name: 'altair-graphql-plugin-plugin-name',
        version: '0.1.1',
        pluginSource: PluginSource.URL,
      });
    });

  });
});
