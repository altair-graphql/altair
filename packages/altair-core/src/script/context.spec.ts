import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getGlobalContext } from './context';
import {
  ScriptContextData,
  RequestType,
  GlobalContextBuilderHandlers,
} from './types';

describe('Script Context', () => {
  let mockHandlers: GlobalContextBuilderHandlers;
  let mockData: ScriptContextData;

  beforeEach(() => {
    mockHandlers = {
      setCookie: vi.fn(),
      request: vi.fn(),
      getStorageItem: vi.fn(),
      setStorageItem: vi.fn(),
    };

    mockData = {
      headers: [],
      variables: '{}',
      operationName: '',
      query: '',
      url: '',
      environment: {
        baseUrl: 'https://api.example.com',
        user: {
          name: 'John Doe',
          profile: {
            email: 'john@example.com',
            settings: {
              theme: 'dark',
            },
          },
        },
        apiKey: 'secret-key',
      },
      requestScriptLogs: [],
      requestType: RequestType.QUERY,
    };
  });

  describe('getEnvironment helper', () => {
    it('should get top-level environment variables', () => {
      const context = getGlobalContext(mockData, mockHandlers);

      expect(context.helpers.getEnvironment('baseUrl')).toBe(
        'https://api.example.com'
      );
      expect(context.helpers.getEnvironment('apiKey')).toBe('secret-key');
    });

    it('should get nested environment variables using dot notation', () => {
      const context = getGlobalContext(mockData, mockHandlers);

      expect(context.helpers.getEnvironment('user.name')).toBe('John Doe');
      expect(context.helpers.getEnvironment('user.profile.email')).toBe(
        'john@example.com'
      );
      expect(context.helpers.getEnvironment('user.profile.settings.theme')).toBe(
        'dark'
      );
    });

    it('should return undefined for non-existent paths', () => {
      const context = getGlobalContext(mockData, mockHandlers);

      expect(context.helpers.getEnvironment('nonexistent')).toBeUndefined();
      expect(context.helpers.getEnvironment('user.nonexistent')).toBeUndefined();
      expect(
        context.helpers.getEnvironment('user.profile.nonexistent')
      ).toBeUndefined();
    });

    it('should handle empty or invalid paths gracefully', () => {
      const context = getGlobalContext(mockData, mockHandlers);

      expect(context.helpers.getEnvironment('')).toBe(mockData.environment);
      expect(context.helpers.getEnvironment('user.')).toBeUndefined();
      expect(context.helpers.getEnvironment('.user')).toBeUndefined();
    });
  });

  describe('setEnvironment helper', () => {
    it('should set top-level environment variables', () => {
      const context = getGlobalContext(mockData, mockHandlers);

      context.helpers.setEnvironment('newVar', 'newValue');
      expect(context.helpers.getEnvironment('newVar')).toBe('newValue');
    });

    it('should set nested environment variables using dot notation', () => {
      const context = getGlobalContext(mockData, mockHandlers);

      context.helpers.setEnvironment('user.age', 30);
      expect(context.helpers.getEnvironment('user.age')).toBe(30);

      context.helpers.setEnvironment('user.profile.settings.language', 'en');
      expect(context.helpers.getEnvironment('user.profile.settings.language')).toBe(
        'en'
      );
    });

    it('should create nested structure when setting deep paths', () => {
      const context = getGlobalContext(mockData, mockHandlers);

      context.helpers.setEnvironment('new.nested.path', 'value');
      expect(context.helpers.getEnvironment('new.nested.path')).toBe('value');
      expect(context.helpers.getEnvironment('new.nested')).toEqual({
        path: 'value',
      });
    });

    it('should set activeEnvironment when activeEnvironment flag is true', () => {
      const context = getGlobalContext(mockData, mockHandlers);

      context.helpers.setEnvironment('testVar', 'testValue', true);
      expect(context.data.__toSetActiveEnvironment).toEqual({
        testVar: 'testValue',
      });

      context.helpers.setEnvironment('nested.var', 'nestedValue', true);
      expect(context.data.__toSetActiveEnvironment?.nested).toEqual({
        var: 'nestedValue',
      });
    });

    it('should not set activeEnvironment when activeEnvironment flag is false', () => {
      const context = getGlobalContext(mockData, mockHandlers);

      context.helpers.setEnvironment('testVar', 'testValue', false);
      expect(context.data.__toSetActiveEnvironment).toBeUndefined();
    });
  });
});
