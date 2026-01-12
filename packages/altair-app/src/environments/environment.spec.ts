import { environment } from './environment';
import pkg from '../../package.json';

describe('Environment configuration', () => {
  it('should define production flag', () => {
    expect(typeof environment.production).toBe('boolean');
  });

  it('should expose application version from package.json', () => {
    expect(environment.version).toBe(pkg.version);
  });

  it('should have serverReady enabled', () => {
    expect(environment.serverReady).toBe(true);
  });
});
