import { TestBed, inject } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService],
      teardown: { destroyAfterEach: false },
    });
  });

  it('should be created', inject([StorageService], (service: StorageService) => {
    expect(service).toBeTruthy();
  }));

  describe('now', () => {
    it('should return current timestamp as number', inject(
      [StorageService],
      (service: StorageService) => {
        const before = Date.now();
        const result = service.now();
        const after = Date.now();
        expect(result).toBeGreaterThanOrEqual(before);
        expect(result).toBeLessThanOrEqual(after);
      }
    ));
  });

  describe('clearAllLocalData', () => {
    it('should clear localStorage', inject(
      [StorageService],
      (service: StorageService) => {
        localStorage.setItem('test-key', 'test-value');
        service.clearAllLocalData();
        expect(localStorage.getItem('test-key')).toBeNull();
      }
    ));
  });
});
