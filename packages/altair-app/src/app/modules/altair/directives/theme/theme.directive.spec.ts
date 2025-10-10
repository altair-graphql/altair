import { ThemeDirective } from './theme.directive';
import { inject, TestBed } from '@angular/core/testing';
import { NzConfigService } from 'ng-zorro-antd/core/config';

describe('ThemeDirective', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false },
      imports: [],
      providers: [ThemeDirective, NzConfigService],
    })
  );

  it('should create an instance', inject(
    [ThemeDirective],
    (directive: ThemeDirective) => {
      expect(directive).toBeTruthy();
    }
  ));
});
