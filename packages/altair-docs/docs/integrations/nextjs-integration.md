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

Create an API route to serve Altair in your Next.js app. You'll need to serve both the HTML and the static assets.

#### Pages Router

```typescript
// pages/api/altair.ts
import { renderAltair, getDistDirectory } from 'altair-static';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).end();
  }

  const altairHtml = renderAltair({
    baseURL: '/api/altair-assets/',
    endpointURL: '/api/graphql',
    subscriptionsEndpoint: 'ws://localhost:3000/api/graphql',  
    initialQuery: `{
      # Welcome to Altair GraphQL Client for Next.js!
      # Start by writing your first query here
    }`,
  });

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(altairHtml);
}
```

```typescript
// pages/api/altair-assets/[...path].ts
import { getDistDirectory } from 'altair-static';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).end();
  }

  const { path: assetPath } = req.query;
  const filePath = path.join(getDistDirectory(), ...(assetPath as string[]));

  if (!fs.existsSync(filePath)) {
    return res.status(404).end();
  }

  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  const fileContent = fs.readFileSync(filePath);

  res.setHeader('Content-Type', contentType);
  res.status(200).send(fileContent);
}
```

#### App Router Version

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
    baseURL: '/api/altair-assets/',
    endpointURL: '/api/graphql',
    subscriptionsEndpoint: process.env.NODE_ENV === 'development' 
      ? 'ws://localhost:3000/api/graphql'
      : `wss://${request.headers.get('host')}/api/graphql`,
    initialQuery: `{
      # Next.js GraphQL Development Interface
      # Replace this with your queries
    }`,
  });

  return new Response(altairHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
```

```typescript
// app/api/altair-assets/[...path]/route.ts
import { getDistDirectory } from 'altair-static';
import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not Found', { status: 404 });
  }

  const filePath = path.join(getDistDirectory(), ...params.path);

  if (!fs.existsSync(filePath)) {
    return new Response('Not Found', { status: 404 });
  }

  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  const fileContent = fs.readFileSync(filePath);

  return new Response(fileContent, {
    headers: {
      'Content-Type': contentType,
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
  };

  if (process.env.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      baseURL: '/api/altair-assets/',
      endpointURL: '/api/graphql',
      subscriptionsEndpoint: 'ws://localhost:3000/api/graphql',
    };
  }

  return {
    ...baseConfig,
    baseURL: '/api/altair-assets/',
    endpointURL: process.env.NEXT_PUBLIC_GRAPHQL_URL || '/api/graphql',
    subscriptionsEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL,
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
    baseURL: '/api/altair-assets/',
    endpointURL: '/api/graphql',
    initialQuery: `{
      # Authenticated GraphQL Playground
      # Your session: ${session?.user?.email || 'Not logged in'}
    }`,
    initialHeaders: session ? {
      'Authorization': `Bearer ${session.accessToken}`,
    } : {},
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
    baseURL: '/api/altair-assets/',
    endpointURL: '/api/graphql',
    initialQuery: `{
      # Next.js Development GraphQL Interface
      # This page is only available in development mode
    }`,
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
  baseURL: '/api/altair-assets/',
  endpointURL: '/api/graphql',
  subscriptionsEndpoint: 'ws://localhost:3000/api/graphql',
  subscriptionsProtocol: 'graphql-ws', // or 'graphql-transport-ws'
});
```

This integration allows you to have a powerful GraphQL development environment directly within your Next.js application, making it easy to test and develop your GraphQL APIs.