import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { PluginRegistryService } from './plugin-registry.service';

describe('PluginRegistryService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule],
    providers: [PluginRegistryService]
  }));

  it('should be created', () => {
    const service: PluginRegistryService = TestBed.get(PluginRegistryService);
    expect(service).toBeTruthy();
  });
});
