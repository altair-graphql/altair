import { ThemeDirective } from './theme.directive';
import { mock } from '../../../../../testing';

describe('ThemeDirective', () => {
  it('should create an instance', () => {
    const directive = new ThemeDirective(mock());
    expect(directive).toBeTruthy();
  });
});
