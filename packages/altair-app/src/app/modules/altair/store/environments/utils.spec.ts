import {
  mergeEnvironments,
  getActiveEnvironmentsList,
  getActiveEnvironment,
  environmentsToEnvironmentVariables,
} from './utils';
import {
  ENVIRONMENT_VARIABLE_SOURCE_TYPE,
  EnvironmentsState,
  IEnvironment,
} from 'altair-graphql-core/build/types/state/environments.interfaces';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';

describe('Environments Utils', () => {
  describe('mergeEnvironments', () => {
    it('should merge two environments', () => {
      const env1: IEnvironment = {
        apiUrl: 'https://api1.example.com',
        apiKey: 'key1',
      };

      const env2: IEnvironment = {
        apiUrl: 'https://api2.example.com',
        token: 'token123',
      };

      const result = mergeEnvironments(env1, env2);

      expect(result).toEqual({
        apiUrl: 'https://api2.example.com', // env2 overrides env1
        apiKey: 'key1',
        token: 'token123',
      });
    });

    it('should deep merge nested objects', () => {
      const env1: IEnvironment = {
        api: {
          url: 'https://api1.example.com',
          timeout: 5000,
        },
      };

      const env2: IEnvironment = {
        api: {
          url: 'https://api2.example.com',
          retries: 3,
        },
      };

      const result = mergeEnvironments(env1, env2);

      expect(result).toEqual({
        api: {
          url: 'https://api2.example.com',
          timeout: 5000,
          retries: 3,
        },
      });
    });
  });

  describe('getActiveEnvironmentsList', () => {
    it('should return base environment when no sub-environment is active', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{"baseVar": "baseValue"}',
        },
        subEnvironments: [],
        activeSubEnvironment: undefined,
      };

      const result = getActiveEnvironmentsList(environmentsState);

      expect(result).toEqual([
        {
          environment: { baseVar: 'baseValue' },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
      ]);
    });

    it('should include active sub-environment when one is active', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{"baseVar": "baseValue"}',
        },
        subEnvironments: [
          {
            id: 'sub1',
            title: 'Development',
            variablesJson: '{"subVar": "subValue"}',
          },
        ],
        activeSubEnvironment: 'sub1',
      };

      const result = getActiveEnvironmentsList(environmentsState);

      expect(result).toEqual([
        {
          environment: { baseVar: 'baseValue' },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
        {
          environment: { subVar: 'subValue' },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.SUB_ENVIRONMENT,
          sourceName: 'Environment',
        },
      ]);
    });

    it('should include collection environments', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{"baseVar": "baseValue"}',
        },
        subEnvironments: [],
        activeSubEnvironment: undefined,
      };

      const windowCollections: IQueryCollection[] = [
        {
          id: 'col1',
          title: 'Collection 1',
          queries: [],
          environmentVariables: {
            colVar1: 'colValue1',
          },
        },
        {
          id: 'col2',
          title: 'Collection 2',
          queries: [],
        },
        {
          id: 'col3',
          title: 'Collection 3',
          queries: [],
          environmentVariables: {
            colVar3: 'colValue3',
          },
        },
      ];

      const result = getActiveEnvironmentsList(environmentsState, windowCollections);

      expect(result).toEqual([
        {
          environment: { baseVar: 'baseValue' },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
        {
          environment: { colVar1: 'colValue1' },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.COLLECTION,
          sourceName: 'Collection 1',
        },
        {
          environment: { colVar3: 'colValue3' },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.COLLECTION,
          sourceName: 'Collection 3',
        },
      ]);
    });

    it('should use "Collection" as sourceName when collection title is missing', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{}',
        },
        subEnvironments: [],
        activeSubEnvironment: undefined,
      };

      const windowCollections: IQueryCollection[] = [
        {
          id: 'col1',
          title: '',
          queries: [],
          environmentVariables: {
            colVar1: 'colValue1',
          },
        },
      ];

      const result = getActiveEnvironmentsList(environmentsState, windowCollections);

      expect(result.at(-1)!.sourceName).toBe('Collection');
    });

    it('should maintain correct order: base, sub, then collections', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{"base": "value"}',
        },
        subEnvironments: [
          {
            id: 'sub1',
            title: 'Dev',
            variablesJson: '{"sub": "value"}',
          },
        ],
        activeSubEnvironment: 'sub1',
      };

      const windowCollections: IQueryCollection[] = [
        {
          id: 'col1',
          title: 'Col1',
          queries: [],
          environmentVariables: { col: 'value' },
        },
      ];

      const result = getActiveEnvironmentsList(environmentsState, windowCollections);

      expect(result).toEqual([
        {
          environment: { base: 'value' },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
        {
          environment: { sub: 'value' },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.SUB_ENVIRONMENT,
          sourceName: 'Environment',
        },
        {
          environment: { col: 'value' },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.COLLECTION,
          sourceName: 'Col1',
        },
      ]);
    });
  });

  describe('getActiveEnvironment', () => {
    it('should merge base and sub environments', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{"baseVar": "baseValue", "shared": "fromBase"}',
        },
        subEnvironments: [
          {
            id: 'sub1',
            title: 'Development',
            variablesJson: '{"subVar": "subValue", "shared": "fromSub"}',
          },
        ],
        activeSubEnvironment: 'sub1',
      };

      const result = getActiveEnvironment(environmentsState);

      expect(result).toEqual({
        baseVar: 'baseValue',
        subVar: 'subValue',
        shared: 'fromSub', // sub environment overrides base
      });
    });

    it('should merge all environments including collections', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{"baseVar": "base"}',
        },
        subEnvironments: [
          {
            id: 'sub1',
            title: 'Dev',
            variablesJson: '{"subVar": "sub"}',
          },
        ],
        activeSubEnvironment: 'sub1',
      };

      const windowCollections: IQueryCollection[] = [
        {
          id: 'col1',
          title: 'Collection 1',
          queries: [],
          environmentVariables: {
            colVar: 'collection',
          },
        },
      ];

      const result = getActiveEnvironment(environmentsState, windowCollections);

      expect(result).toEqual({
        baseVar: 'base',
        subVar: 'sub',
        colVar: 'collection',
      });
    });

    it('should override in correct order: base < sub < collections', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{"var": "base", "var2": "base2"}',
        },
        subEnvironments: [
          {
            id: 'sub1',
            title: 'Dev',
            variablesJson: '{"var": "sub"}',
          },
        ],
        activeSubEnvironment: 'sub1',
      };

      const windowCollections: IQueryCollection[] = [
        {
          id: 'col1',
          title: 'Collection 1',
          queries: [],
          environmentVariables: {
            var: 'collection',
          },
        },
      ];

      const result = getActiveEnvironment(environmentsState, windowCollections);

      expect(result.var).toBe('collection'); // collection overrides all
      expect(result.var2).toBe('base2'); // only in base
    });

    it('should return empty object when no environments are set', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{}',
        },
        subEnvironments: [],
        activeSubEnvironment: undefined,
      };

      const result = getActiveEnvironment(environmentsState);

      expect(result).toEqual({});
    });

    it('should handle multiple collection environments', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{}',
        },
        subEnvironments: [],
        activeSubEnvironment: undefined,
      };

      const windowCollections: IQueryCollection[] = [
        {
          id: 'col1',
          title: 'Collection 1',
          queries: [],
          environmentVariables: {
            var1: 'col1',
            shared: 'col1',
          },
        },
        {
          id: 'col2',
          title: 'Collection 2',
          queries: [],
          environmentVariables: {
            var2: 'col2',
            shared: 'col2',
          },
        },
      ];

      const result = getActiveEnvironment(environmentsState, windowCollections);

      expect(result).toEqual({
        var1: 'col1',
        var2: 'col2',
        shared: 'col2', // later collection overrides earlier
      });
    });

    it('should deep merge nested environments', () => {
      const environmentsState: EnvironmentsState = {
        base: {
          variablesJson: '{"api": {"url": "https://base.com", "timeout": 5000}}',
        },
        subEnvironments: [
          {
            id: 'sub1',
            title: 'Dev',
            variablesJson: '{"api": {"url": "https://dev.com", "retries": 3}}',
          },
        ],
        activeSubEnvironment: 'sub1',
      };

      const result = getActiveEnvironment(environmentsState);

      expect(result).toEqual({
        api: {
          url: 'https://dev.com', // overridden
          timeout: 5000, // from base
          retries: 3, // from sub
        },
      });
    });
  });

  describe('environmentsToEnvironmentVariables', () => {
    it('should flatten simple environment variables', () => {
      const environments = [
        {
          environment: {
            var1: 'value1',
            var2: 'value2',
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
      ];

      const result = environmentsToEnvironmentVariables(environments);

      expect(result).toEqual({
        var1: {
          key: 'var1',
          value: 'value1',
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
        var2: {
          key: 'var2',
          value: 'value2',
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
      });
    });

    it('should flatten nested environment variables with dot notation', () => {
      const environments = [
        {
          environment: {
            api: {
              url: 'https://api.example.com',
              timeout: 5000,
            },
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
      ];

      const result = environmentsToEnvironmentVariables(environments);

      expect(result).toEqual({
        'api.url': {
          key: 'api.url',
          value: 'https://api.example.com',
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
        'api.timeout': {
          key: 'api.timeout',
          value: 5000,
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
      });
    });

    it('should handle deeply nested objects', () => {
      const environments = [
        {
          environment: {
            level1: {
              level2: {
                level3: {
                  value: 'deep',
                },
              },
            },
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
      ];

      const result = environmentsToEnvironmentVariables(environments);

      expect(result['level1.level2.level3.value']).toEqual({
        key: 'level1.level2.level3.value',
        value: 'deep',
        sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
        sourceName: 'Global Environment',
      });
    });

    it('should override variables from earlier environments with later ones', () => {
      const environments = [
        {
          environment: {
            var: 'first',
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
        {
          environment: {
            var: 'second',
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.SUB_ENVIRONMENT,
          sourceName: 'Environment',
        },
      ];

      const result = environmentsToEnvironmentVariables(environments);

      expect(result.var).toEqual({
        key: 'var',
        value: 'second',
        sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.SUB_ENVIRONMENT,
        sourceName: 'Environment',
      });
    });

    it('should handle arrays as values', () => {
      const environments = [
        {
          environment: {
            items: ['item1', 'item2', 'item3'],
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
      ];

      const result = environmentsToEnvironmentVariables(environments);

      expect(result.items).toEqual({
        key: 'items',
        value: ['item1', 'item2', 'item3'],
        sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
        sourceName: 'Global Environment',
      });
    });

    it('should handle different value types', () => {
      const environments = [
        {
          environment: {
            stringVar: 'text',
            numberVar: 42,
            boolVar: true,
            arrayVar: [1, 2, 3],
            nullVar: null,
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
      ];

      const result = environmentsToEnvironmentVariables(environments);

      expect(result.stringVar!.value).toBe('text');
      expect(result.numberVar!.value).toBe(42);
      expect(result.boolVar!.value).toBe(true);
      expect(result.arrayVar!.value).toEqual([1, 2, 3]);
      expect(result.nullVar!.value).toBe(null);
    });

    it('should track source information for each variable', () => {
      const environments = [
        {
          environment: {
            baseVar: 'base',
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
        {
          environment: {
            subVar: 'sub',
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.SUB_ENVIRONMENT,
          sourceName: 'Development',
        },
        {
          environment: {
            colVar: 'col',
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.COLLECTION,
          sourceName: 'My Collection',
        },
      ];

      const result = environmentsToEnvironmentVariables(environments);

      expect(result).toEqual({
        baseVar: {
          key: 'baseVar',
          value: 'base',
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
        subVar: {
          key: 'subVar',
          value: 'sub',
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.SUB_ENVIRONMENT,
          sourceName: 'Development',
        },
        colVar: {
          key: 'colVar',
          value: 'col',
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.COLLECTION,
          sourceName: 'My Collection',
        },
      });
    });

    it('should handle mixed nested and flat variables', () => {
      const environments = [
        {
          environment: {
            flat: 'value',
            nested: {
              deep: 'deepValue',
            },
            anotherFlat: 'value2',
          },
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
      ];

      const result = environmentsToEnvironmentVariables(environments);

      expect(result).toEqual({
        flat: {
          key: 'flat',
          value: 'value',
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
        'nested.deep': {
          key: 'nested.deep',
          value: 'deepValue',
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
        anotherFlat: {
          key: 'anotherFlat',
          value: 'value2',
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
          sourceName: 'Global Environment',
        },
      });
    });
  });
});
