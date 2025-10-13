import { inject, TestBed } from '@angular/core/testing';
import { FileDropDirective } from './file-drop.directive';

describe('FileDropDirective', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [],
      providers: [FileDropDirective],
    })
  );

  it('should create an instance', inject(
    [FileDropDirective],
    (directive: FileDropDirective) => {
      expect(directive).toBeTruthy();
    }
  ));
});
