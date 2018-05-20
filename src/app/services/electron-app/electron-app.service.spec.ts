import { TestBed, inject } from '@angular/core/testing';

import { ElectronAppService } from './electron-app.service';

describe('ElectronAppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElectronAppService]
    });
  });

  it('should be created', inject([ElectronAppService], (service: ElectronAppService) => {
    expect(service).toBeTruthy();
  }));
});
