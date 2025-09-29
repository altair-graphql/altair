---
parent: Integrations
---

# React Integration

Integrate Altair GraphQL Client into your React applications for development, testing, and even production GraphQL exploration.

## Installation

Install the required packages:

```bash
npm install altair-static
# For React development server integration
npm install --save-dev @types/react @types/react-dom
```

## Development Integration

### Create React App Integration

For Create React App projects, create a development route:

```jsx
// src/components/AltairDev.jsx
import React, { useEffect, useState } from 'react';

const AltairDev = () => {
  const [altairHtml, setAltairHtml] = useState('');
  
  useEffect(() => {
    // Only load in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const loadAltair = async () => {
      try {
        const { renderAltair } = await import('altair-static');
        
        const html = renderAltair({
          endpointURL: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql',
          subscriptionsEndpoint: process.env.REACT_APP_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
          initialQuery: `{
            # React Development GraphQL Interface
            # Start building your queries here!
            
            # Example query:
            # users {
            #   id
            #   name
            #   email
            # }
          }`,
          settings: {
            'theme': 'dark',
            'request.withCredentials': true,
            'schema.reloadOnStart': true,
          },
        });
        
        setAltairHtml(html);
      } catch (error) {
        console.error('Failed to load Altair:', error);
      }
    };

    loadAltair();
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return <div>GraphQL interface not available in production</div>;
  }

  return (
    <div 
      style={{ height: '100vh', width: '100%' }}
      dangerouslySetInnerHTML={{ __html: altairHtml }}
    />
  );
};

export default AltairDev;
```

### Router Integration

Add Altair to your React Router setup:

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AltairDev from './components/AltairDev';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Only available in development */}
        {process.env.NODE_ENV === 'development' && (
          <Route path="/graphql" element={<AltairDev />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
```

## Vite Integration

For Vite-powered React apps:

```jsx
// src/components/AltairDev.jsx
import React, { useEffect, useState } from 'react';

const AltairDev = () => {
  const [altairHtml, setAltairHtml] = useState('');

  useEffect(() => {
    // Check if we're in development
    if (import.meta.env.MODE !== 'development') {
      return;
    }

    const loadAltair = async () => {
      const { renderAltair } = await import('altair-static');
      
      const html = renderAltair({
        endpointURL: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
        subscriptionsEndpoint: import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
        initialQuery: `{
          # Vite + React GraphQL Development
          # Environment: ${import.meta.env.MODE}
        }`,
        settings: {
          'theme': 'dark',
          'editor.fontSize': 14,
        },
      });
      
      setAltairHtml(html);
    };

    loadAltair();
  }, []);

  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div 
      className="altair-container"
      style={{ height: '100vh' }}
      dangerouslySetInnerHTML={{ __html: altairHtml }}
    />
  );
};

export default AltairDev;
```

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Make sure Node.js globals are available
    global: 'globalThis',
  },
  server: {
    proxy: {
      // Proxy GraphQL requests to your backend
      '/graphql': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying for subscriptions
      },
    },
  },
});
```

## Apollo Client Integration

Integrate with Apollo Client for seamless development:

```jsx
// src/components/AltairWithApollo.jsx
import React, { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';

const AltairWithApollo = () => {
  const [altairHtml, setAltairHtml] = useState('');
  const apolloClient = useApolloClient();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const loadAltair = async () => {
      const { renderAltair } = await import('altair-static');
      
      // Get Apollo Client's HTTP link URI
      const httpLink = apolloClient.link;
      const endpointURL = httpLink?.options?.uri || '/graphql';
      
      const html = renderAltair({
        endpointURL,
        initialQuery: `{
          # Apollo Client + Altair Integration
          # Using endpoint: ${endpointURL}
          
          # Your Apollo cache policies and resolvers are active
          # Test your queries here before implementing in components
        }`,
        initialHeaders: {
          // Pass through Apollo's default headers
          'Content-Type': 'application/json',
        },
        settings: {
          'theme': 'dark',
          'request.withCredentials': true,
        },
      });
      
      setAltairHtml(html);
    };

    loadAltair();
  }, [apolloClient]);

  if (process.env.NODE_ENV !== 'development') {
    return <div>Development tools not available</div>;
  }

  return (
    <div style={{ height: '100vh' }}>
      <div dangerouslySetInnerHTML={{ __html: altairHtml }} />
    </div>
  );
};

export default AltairWithApollo;
```

## Authentication Integration

### JWT Token Integration

```jsx
// src/components/AuthenticatedAltair.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Your auth context

const AuthenticatedAltair = () => {
  const [altairHtml, setAltairHtml] = useState('');
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const loadAltair = async () => {
      const { renderAltair } = await import('altair-static');
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const html = renderAltair({
        endpointURL: '/graphql',
        initialQuery: `{
          # Authenticated GraphQL Interface
          # Logged in as: ${user?.email || 'Not authenticated'}
          
          # Your JWT token is automatically included in requests
          me {
            id
            email
            profile {
              name
            }
          }
        }`,
        initialHeaders: headers,
        settings: {
          'theme': 'dark',
          'request.withCredentials': true,
        },
      });
      
      setAltairHtml(html);
    };

    loadAltair();
  }, [token, user]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{ height: '100vh' }}>
      {!token && (
        <div style={{ padding: '20px', background: '#f0f0f0' }}>
          <strong>Note:</strong> You are not authenticated. Some queries may fail.
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: altairHtml }} />
    </div>
  );
};

export default AuthenticatedAltair;
```

## Production-Safe Integration

### Conditional Loading

```jsx
// src/components/ConditionalAltair.jsx
import React, { lazy, Suspense } from 'react';

// Lazy load Altair only when needed
const AltairDev = lazy(() => 
  process.env.NODE_ENV === 'development' 
    ? import('./AltairDev')
    : Promise.resolve({ default: () => null })
);

const ConditionalAltair = () => {
  // Additional runtime checks
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  const showAltair = isDevelopment && isLocalhost;

  if (!showAltair) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>GraphQL Interface</h2>
        <p>This development tool is only available in development mode on localhost.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading GraphQL interface...</div>}>
      <AltairDev />
    </Suspense>
  );
};

export default ConditionalAltair;
```

### Environment Configuration

```javascript
// src/config/altair.js
export const getAltairConfig = () => {
  const baseConfig = {
    settings: {
      'theme': 'dark',
      'editor.fontSize': 14,
      'request.withCredentials': true,
    },
  };

  if (process.env.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      endpointURL: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql',
      subscriptionsEndpoint: process.env.REACT_APP_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
      initialQuery: `{
        # Development GraphQL Interface
        # Environment: ${process.env.NODE_ENV}
        # API URL: ${process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql'}
      }`,
      settings: {
        ...baseConfig.settings,
        'request.timeout': 30000, // Longer timeout for development
        'schema.reloadOnStart': true,
      },
    };
  }

  // Production config (if enabled)
  return {
    ...baseConfig,
    endpointURL: process.env.REACT_APP_GRAPHQL_URL,
    subscriptionsEndpoint: process.env.REACT_APP_GRAPHQL_WS_URL,
    initialQuery: `{
      # Production GraphQL Interface
      # Use with caution!
    }`,
    settings: {
      ...baseConfig.settings,
      'request.timeout': 10000,
    },
  };
};
```

## TypeScript Integration

### Typed Altair Component

```tsx
// src/components/AltairDev.tsx
import React, { useEffect, useState } from 'react';
import { RenderOptions } from 'altair-static';

interface AltairDevProps {
  endpoint?: string;
  subscriptionsEndpoint?: string;
  initialQuery?: string;
  className?: string;
  style?: React.CSSProperties;
}

const AltairDev: React.FC<AltairDevProps> = ({
  endpoint,
  subscriptionsEndpoint,
  initialQuery,
  className = '',
  style = { height: '100vh' },
}) => {
  const [altairHtml, setAltairHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      setError('Altair is only available in development mode');
      setLoading(false);
      return;
    }

    const loadAltair = async () => {
      try {
        const { renderAltair } = await import('altair-static');
        
        const config: RenderOptions = {
          endpointURL: endpoint || process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql',
          subscriptionsEndpoint: subscriptionsEndpoint || process.env.REACT_APP_GRAPHQL_WS_URL,
          initialQuery: initialQuery || `{
            # TypeScript React + Altair GraphQL Interface
            # Start building type-safe queries here!
          }`,
          settings: {
            'theme': 'dark',
            'request.withCredentials': true,
            'schema.reloadOnStart': true,
          },
        };
        
        const html = renderAltair(config);
        setAltairHtml(html);
      } catch (err) {
        setError(`Failed to load Altair: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadAltair();
  }, [endpoint, subscriptionsEndpoint, initialQuery]);

  if (loading) {
    return <div style={style}>Loading GraphQL interface...</div>;
  }

  if (error) {
    return (
      <div style={style}>
        <div style={{ padding: '20px', color: 'red' }}>
          <h3>Error loading Altair</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: altairHtml }}
    />
  );
};

export default AltairDev;
```

### Usage with GraphQL Code Generator

```tsx
// src/components/TypedAltair.tsx
import React from 'react';
import AltairDev from './AltairDev';
import { GetUsersDocument } from '../generated/graphql'; // Generated types

const TypedAltair: React.FC = () => {
  // Convert GraphQL document to string for initial query
  const initialQuery = GetUsersDocument.loc?.source.body || `{
    users {
      id
      name
      email
    }
  }`;

  return (
    <AltairDev
      initialQuery={initialQuery}
      endpoint="/graphql"
    />
  );
};

export default TypedAltair;
```

## Custom Hooks Integration

### useAltair Hook

```tsx
// src/hooks/useAltair.ts
import { useState, useEffect } from 'react';

interface UseAltairOptions {
  endpoint?: string;
  subscriptionsEndpoint?: string;
  initialQuery?: string;
  enabled?: boolean;
}

export const useAltair = (options: UseAltairOptions = {}) => {
  const [altairHtml, setAltairHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    endpoint = process.env.REACT_APP_GRAPHQL_URL || '/graphql',
    subscriptionsEndpoint,
    initialQuery = '{ # Start writing your GraphQL queries here }',
    enabled = process.env.NODE_ENV === 'development',
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const loadAltair = async () => {
      setLoading(true);
      setError(null);

      try {
        const { renderAltair } = await import('altair-static');
        
        const html = renderAltair({
          endpointURL: endpoint,
          subscriptionsEndpoint,
          initialQuery,
          settings: {
            'theme': 'dark',
          },
        });
        
        setAltairHtml(html);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadAltair();
  }, [endpoint, subscriptionsEndpoint, initialQuery, enabled]);

  return { altairHtml, loading, error, enabled };
};

// Usage
const MyComponent = () => {
  const { altairHtml, loading, error } = useAltair({
    endpoint: '/api/graphql',
    initialQuery: `{
      users {
        id
        name
      }
    }`,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div dangerouslySetInnerHTML={{ __html: altairHtml }} />;
};
```

## Best Practices

### Security Considerations
- Always restrict Altair to development environments
- Implement proper authentication for production use
- Use environment variables for configuration
- Consider IP whitelisting for sensitive environments

### Performance Optimization
- Use lazy loading to avoid including Altair in production bundles
- Implement error boundaries around Altair components
- Cache Altair HTML when possible
- Use code splitting for development-only components

### Development Workflow
- Set up consistent endpoint configurations across team
- Use version control for Altair configurations
- Document common queries and mutations
- Integrate with your existing authentication system

This React integration provides a seamless development experience while maintaining production safety and performance considerations.