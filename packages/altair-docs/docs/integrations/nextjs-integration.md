---
parent: Integrations
---

# Next.js Integration

Learn how to integrate Altair GraphQL Client into your Next.js applications for development and testing purposes.

## Installation Options

### Using altair-static

For Next.js applications, use the `altair-static` package:

```bash
npm install altair-static
# or
yarn add altair-static
# or
pnpm add altair-static
```

## Basic Integration

### API Route Setup

Create an API route to serve Altair in your Next.js app:

```typescript
// pages/api/altair.ts (Pages Router)
// or app/api/altair/route.ts (App Router)

import { renderAltair } from 'altair-static';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).end();
  }

  const altairHtml = renderAltair({
    endpointURL: '/api/graphql',
    subscriptionsEndpoint: 'ws://localhost:3000/api/graphql',  
    initialQuery: `{
      # Welcome to Altair GraphQL Client for Next.js!
      # Start by writing your first query here
    }`,
    settings: {
      'theme': 'dark',
      'theme.fontsize': 14,
    },
  });

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(altairHtml);
}
```

### App Router Version

For Next.js 13+ with App Router:

```typescript
// app/api/altair/route.ts
import { renderAltair } from 'altair-static';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not Found', { status: 404 });
  }

  const altairHtml = renderAltair({
    endpointURL: '/api/graphql',
    subscriptionsEndpoint: process.env.NODE_ENV === 'development' 
      ? 'ws://localhost:3000/api/graphql'
      : `wss://${request.headers.get('host')}/api/graphql`,
    initialQuery: `{
      # Next.js GraphQL Development Interface
      # Replace this with your queries
    }`,
    settings: {
      'request.withCredentials': true,
    },
  });

  return new Response(altairHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
```

## Advanced Configuration

### Environment-Specific Setup

```typescript
// lib/altair-config.ts
export const getAltairConfig = () => {
  const baseConfig = {
    initialQuery: `{
      # GraphQL Playground for ${process.env.NODE_ENV}
      # Endpoint: ${process.env.NEXT_PUBLIC_GRAPHQL_URL || '/api/graphql'}
    }`,
    settings: {
      'theme': 'dark',
      'request.withCredentials': true,
      'schema.reloadOnStart': true,
    },
  };

  if (process.env.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      endpointURL: '/api/graphql',
      subscriptionsEndpoint: 'ws://localhost:3000/api/graphql',
      settings: {
        ...baseConfig.settings,
        'request.timeout': 30000, // Longer timeout for dev
      },
    };
  }

  return {
    ...baseConfig,
    endpointURL: process.env.NEXT_PUBLIC_GRAPHQL_URL || '/api/graphql',
    subscriptionsEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL,
    settings: {
      ...baseConfig.settings,
      'request.timeout': 10000,
    },
  };
};

// pages/api/altair.ts
import { renderAltair } from 'altair-static';
import { getAltairConfig } from '../../lib/altair-config';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).end();
  }

  const altairHtml = renderAltair(getAltairConfig());
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(altairHtml);
}
```

### Authentication Integration

```typescript
// pages/api/altair.ts
import { renderAltair } from 'altair-static';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).end();
  }

  // Get user session for authenticated requests
  const session = await getServerSession(req, res, authOptions);
  
  const altairHtml = renderAltair({
    endpointURL: '/api/graphql',
    initialQuery: `{
      # Authenticated GraphQL Playground
      # Your session: ${session?.user?.email || 'Not logged in'}
    }`,
    initialHeaders: session ? {
      'Authorization': `Bearer ${session.accessToken}`,
    } : {},
    settings: {
      'theme': 'dark',
      'request.withCredentials': true,
    },
  });

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(altairHtml);
}
```

## GraphQL Server Integration

### With Apollo Server

```typescript
// pages/api/graphql.ts
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs, resolvers } from '../../lib/schema';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Enable introspection in development
  introspection: process.env.NODE_ENV === 'development',
  plugins: [
    // Add Apollo Studio plugin for production
    process.env.NODE_ENV === 'production' && 
    require('@apollo/server/plugin/usage-reporting').default({
      sendVariableValues: { none: true },
    }),
  ].filter(Boolean),
});

export default startServerAndCreateNextHandler(server, {
  context: async (req, res) => ({
    req,
    res,
    // Add user context from session
    user: await getUserFromRequest(req),
  }),
});
```

### With GraphQL Yoga

```typescript
// pages/api/graphql.ts
import { createYoga } from 'graphql-yoga';
import { schema } from '../../lib/schema';

export default createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  // Enable GraphiQL only in development
  graphiql: process.env.NODE_ENV === 'development',
})

export const config = {
  api: {
    bodyParser: false,
  },
}
```

## Development Workflow

### Package.json Scripts

Add convenient scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:altair": "next dev && open http://localhost:3000/api/altair",
    "graphql:introspect": "graphql-codegen --config codegen.yml",
    "graphql:validate": "graphql-inspector validate schema.graphql 'src/**/*.graphql'"
  }
}
```

### Development Page Component

Create a dedicated development page:

```tsx
// pages/dev/graphql.tsx (only available in development)
import { GetServerSideProps } from 'next';
import { renderAltair } from 'altair-static';

interface Props {
  altairHtml: string;
}

export default function GraphQLDev({ altairHtml }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: altairHtml }} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Redirect in production
  if (process.env.NODE_ENV !== 'development') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const altairHtml = renderAltair({
    endpointURL: '/api/graphql',
    initialQuery: `{
      # Next.js Development GraphQL Interface
      # This page is only available in development mode
    }`,
    settings: {
      'theme': 'dark',
    },
  });

  return {
    props: {
      altairHtml,
    },
  };
};
```

## TypeScript Integration

### Generating Types from Schema

```typescript
// lib/graphql-types.ts
import { GraphQLResolveInfo } from 'graphql';

export type Maybe<T> = T | null;
export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

// Auto-generated types from your schema
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Query {
  users: User[];
  user: (args: { id: string }) => User | null;
}
```

### Type-Safe Resolvers

```typescript
// lib/resolvers.ts
import { Query, User } from './graphql-types';

export const resolvers: { Query: Query } = {
  Query: {
    users: async () => {
      // Type-safe resolver implementation
      return await getUsersFromDatabase();
    },
    user: async (_, { id }) => {
      return await getUserById(id);
    },
  },
};
```

## Production Considerations

### Security Setup

```typescript
// pages/api/altair.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Multiple layers of protection
  
  // 1. Environment check
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).end();
  }
  
  // 2. IP whitelist (optional)
  const allowedIPs = ['127.0.0.1', '::1']; // localhost only
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  if (!allowedIPs.includes(clientIP as string)) {
    return res.status(403).end();
  }
  
  // 3. Basic auth (optional)
  const auth = req.headers.authorization;
  if (!auth || auth !== `Basic ${Buffer.from('dev:password').toString('base64')}`) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Altair"');
    return res.status(401).end();
  }

  // Render Altair
  const altairHtml = renderAltair({
    endpointURL: '/api/graphql',
  });

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(altairHtml);
}
```

### Environment Variables

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_GRAPHQL_URL=/api/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:3000/api/graphql

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

## Best Practices

### Development Setup
- Only enable Altair in development environments
- Use environment variables for configuration
- Implement proper authentication if needed
- Set up IP whitelisting for additional security

### Performance
- Use code splitting to avoid including Altair in production bundles
- Configure appropriate timeouts for development vs production
- Enable caching for schema introspection where appropriate

### Team Collaboration
- Share Altair configurations through version control
- Document common queries and mutations
- Use consistent naming conventions for operations
- Set up automated schema validation

### Error Handling

```typescript
// pages/api/altair.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ error: 'Not found' });
    }

    const altairHtml = renderAltair({
      endpointURL: '/api/graphql',
    });

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(altairHtml);
  } catch (error) {
    console.error('Error rendering Altair:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

## Common Issues and Solutions

### CORS Issues
```typescript
// pages/api/graphql.ts
export default createYoga({
  schema,
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000'] 
      : [process.env.NEXT_PUBLIC_APP_URL],
    credentials: true,
  },
})
```

### WebSocket Subscriptions
```typescript
// For WebSocket subscriptions in development
const altairHtml = renderAltair({
  endpointURL: '/api/graphql',
  subscriptionsEndpoint: 'ws://localhost:3000/api/graphql',
  subscriptionsProtocol: 'graphql-ws', // or 'graphql-transport-ws'
});
```

This integration allows you to have a powerful GraphQL development environment directly within your Next.js application, making it easy to test and develop your GraphQL APIs.