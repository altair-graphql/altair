import { TestBed } from '@angular/core/testing';

import { PluginRegistryService } from './plugin-registry.service';

describe('PluginRegistryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PluginRegistryService = TestBed.get(PluginRegistryService);
    expect(service).toBeTruthy();
  });
});
