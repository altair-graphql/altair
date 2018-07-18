import { TestBed, inject } from '@angular/core/testing';

import { KeybinderService } from './keybinder.service';

describe('KeybinderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeybinderService]
    });
  });

  it('should be created', inject([KeybinderService], (service: KeybinderService) => {
    expect(service).toBeTruthy();
  }));
});
