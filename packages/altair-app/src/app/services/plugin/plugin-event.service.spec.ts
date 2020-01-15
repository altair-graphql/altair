import { TestBed } from '@angular/core/testing';

import { PluginEventService } from './plugin-event.service';

describe('PluginEventService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PluginEventService = TestBed.get(PluginEventService);
    expect(service).toBeTruthy();
  });
});
