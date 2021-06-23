import { TestBed } from '@angular/core/testing';
import * as fromRoot from '../../store';

import { EnvironmentService } from './environment.service';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { mock } from '../../../../../testing';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

let mockStore: Store<RootState>;

const createEnvironmentState = ({
  base = {},
  subEnvironments = [],
  activeIndex = undefined
}: { base?: any, subEnvironments?: any[], activeIndex?: number } = {}) => {
  return {
    base: {
      variablesJson: JSON.stringify(base)
    },
    subEnvironments: subEnvironments.map((env, i) => ({
      id: `${i}`,
      variablesJson: JSON.stringify(env),
    })),
    activeSubEnvironment: `${activeIndex}`
  }
};

const createStoreSubscribeFn = (environments: any) => {
  return (fn: any) => {
    typeof fn === 'function' ? fn({ environments }) : fn.next({ environments });
    return new Subscription();
  }
};

describe('EnvironmentService', () => {
  beforeEach(() => {
    const environments = createEnvironmentState({
      base: {
        baseUrl: 'https://example.api'
      }
    })
    mockStore = mock();
    mockStore.subscribe = createStoreSubscribeFn(environments);
    TestBed.configureTestingModule({
      providers: [
        EnvironmentService,
        {
          provide: Store,
          useFactory: () => mockStore,
        },
      ]
    });
  });

  it('should be created', () => {
    const service: EnvironmentService = TestBed.inject(EnvironmentService);
    expect(service).toBeTruthy();
  });

  describe('.getActiveEnvironment()', () => {
    it('should return base environment', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const activeEnvironment = service.getActiveEnvironment();
      expect(activeEnvironment).toEqual({
        baseUrl: 'https://example.api'
      });
    });

    it('should merge base and active sub environment', () => {
      const environments = createEnvironmentState({
        base: {
          baseUrl: 'https://example.api',
          var1: 'base value'
        },
        subEnvironments: [
          {
            baseUrl: 'https://environment-1.api',
            var2: 'environment1 value',
          },
          {
            baseUrl: 'https://environment-2.api',
            var3: 'environment2 value',
          }
        ],
        activeIndex: 0
      });
      mockStore.subscribe = createStoreSubscribeFn(environments);
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const activeEnvironment = service.getActiveEnvironment();
      expect(activeEnvironment).toEqual({
        baseUrl: 'https://environment-1.api',
        var1: 'base value',
        var2: 'environment1 value',
      });
    });
  });

  describe('.hydrate()', () => {
    it('should returns empty if content is empty string', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrate('');
      expect(hydratedContent).toBe('');
    });
    it('should hydrate content with active environment', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrate('current URL is {{baseUrl}}!');
      expect(hydratedContent).toBe('current URL is https://example.api!');
    });

    it('should hydrate content with provided environment', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrate('current URL is {{baseUrl}}!', {
        activeEnvironment: { baseUrl: 'https://provided.url' }
      });
      expect(hydratedContent).toBe('current URL is https://provided.url!');
    });

    it('should strip content if matching environment variable not exists', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrate('current URL is {{baseUrl}}!', {
        activeEnvironment: {}
      });
      expect(hydratedContent).toBe('current URL is !');
    });

    it('should hydrate content with nested environment variable', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrate('current URL is {{meta.url}}!', {
        activeEnvironment: {
          meta: {
            url: 'sirmuel.design',
          },
        }
      });
      expect(hydratedContent).toBe('current URL is sirmuel.design!');
    });

    it('should hydrate multiple variables with random character between', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrate('putting both together gives .{{first}}.{{second}}!', {
        activeEnvironment: {
          first: '1',
          second: '2',
        }
      });
      expect(hydratedContent).toBe('putting both together gives .1.2!');
    });

    it('should hydrate multiple variables next to each other properly', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrate('putting both together gives: {{first}}{{second}}!', {
        activeEnvironment: {
          first: '1',
          second: '2',
        }
      });
      expect(hydratedContent).toBe('putting both together gives: 12!');
    });

    it('should render escaped content without hydrating it', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrate(`current URL is \\{{baseUrl}}!`, {
        activeEnvironment: { baseUrl: 'https://provided.url' }
      });
      expect(hydratedContent).toBe(`current URL is {{baseUrl}}!`);
    });
  });

  describe('.hydrateHeaders()', () => {
    it('should hydrate headers with active environment', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrateHeaders([
        {
          key: 'x-api-url',
          value: '{{baseUrl}}',
          enabled: true
        }
      ]);
      expect(hydratedContent).toEqual([
        {
          key: 'x-api-url',
          value: 'https://example.api',
          enabled: true
        }
      ]);
    });

    it('should hydrate headers with provided environment', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrateHeaders([
        {
          key: 'x-api-url',
          value: '{{baseUrl}}',
          enabled: true
        }
      ], {
        activeEnvironment: { baseUrl: 'https://provided.url' }
      });
      expect(hydratedContent).toEqual([
        {
          key: 'x-api-url',
          value: 'https://provided.url',
          enabled: true
        }
      ]);
    });

    it('should merge headers with headers payload in active environment', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrateHeaders([
        {
          key: 'x-api-url',
          value: '{{baseUrl}}',
          enabled: true
        }
      ], {
        activeEnvironment: {
          baseUrl: 'https://provided.url',
          headers: {
            'x-global-token': 'global'
          }
        }
      });
      expect(hydratedContent).toEqual([
        {
          key: 'x-global-token',
          value: 'global',
          enabled: true
        },
        {
          key: 'x-api-url',
          value: 'https://provided.url',
          enabled: true
        },
      ]);
    });

    it('should merge headers and hydrate headers payload in active environment', () => {
      const service: EnvironmentService = TestBed.inject(EnvironmentService);
      const hydratedContent = service.hydrateHeaders([
        {
          key: 'x-api-url',
          value: '{{baseUrl}}',
          enabled: true
        }
      ], {
        activeEnvironment: {
          baseUrl: 'https://provided.url',
          globalValue: 'global value',
          headers: {
            'x-global-token': '{{globalValue}}'
          }
        }
      });
      expect(hydratedContent).toEqual([
        {
          key: 'x-global-token',
          value: 'global value',
          enabled: true
        },
        {
          key: 'x-api-url',
          value: 'https://provided.url',
          enabled: true
        },
      ]);
    });
  });
});
