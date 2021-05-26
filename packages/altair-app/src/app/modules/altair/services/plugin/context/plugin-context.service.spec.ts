import { expect, describe, it, beforeEach } from '@jest/globals';
import { TestBed } from '@angular/core/testing';

import { PluginContextService } from './plugin-context.service';
import { Store } from '@ngrx/store';
import { mockStoreFactory, mock } from '../../../../../../testing';
import { WindowService } from '../../../services/window.service';
import { PluginEventService } from '../plugin-event.service';
import { AltairPlugin, PluginType } from '../plugin';
import { NotifyService } from '../../../services/notify/notify.service';
import { SubscriptionProviderRegistryService } from '../../subscriptions/subscription-provider-registry.service';

describe('PluginContextService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: Store,
        useValue: mockStoreFactory({}),
      },
      {
        provide: WindowService,
        useFactory: () => mock(),
      },
      {
        provide: NotifyService,
        useFactory: () => mock(),
      },
      {
        provide: PluginEventService,
        useFactory: () => mock<PluginEventService>({
          group: () => ({} as unknown as any),
        }),
      },
      {
        provide: SubscriptionProviderRegistryService,
        useFactory: () => mock(),
      },
    ]
  }));

  it('should be created', () => {
    const service: PluginContextService = TestBed.inject(PluginContextService);
    expect(service).toBeTruthy();
  });

  it('should create context for specified plugin', () => {
    const service: PluginContextService = TestBed.inject(PluginContextService);
    const testPlugin: AltairPlugin = {
      name: 'Test',
      display_name: 'Test plugin',
      capabilities: [],
      manifest: {
        manifest_version: 2,
        name: 'Test',
        description: 'plugin description',
        display_name: 'Test plugin',
        scripts: [],
        version: '0.0.1',
      }
    };
    const ctx = service.createContext('test-plugin', testPlugin);
    expect(ctx).toBeTruthy();
    expect(ctx.app).toBeTruthy();
  });
});
