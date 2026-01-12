import { environment } from './environment';
import pkg from '../../package.json';

describe('Environment configuration', () => {
  it('should have production flag set to false', () => {
    expect(environment.production).toBe(false);
  });

  it('should expose application version from package.json', () => {
    expect(environment.version).toBe(pkg.version);
  });

  it('should have serverReady enabled', () => {
    expect(environment.serverReady).toBe(true);
  });
});
