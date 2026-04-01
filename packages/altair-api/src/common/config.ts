import { env } from './env';

export type { AiModelProvider } from './env';

const config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: env.NODE_ENV !== 'production',
    title: 'Altair API',
    description: 'The Altair API description',
    version: '1.0',
    path: 'swagger',
  },
  allowedRedirectOrigins: env.ALLOWED_REDIRECT_ORIGINS.split(','),
  security: {
    shortExpiresIn: '30s',
    expiresIn: '2d',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },

  // Auth & OAuth — exposed so configService.get() reads validated values
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  EVENTS_JWT_ACCESS_SECRET: env.EVENTS_JWT_ACCESS_SECRET,
  GOOGLE_OAUTH_CLIENT_ID: env.GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET: env.GOOGLE_OAUTH_CLIENT_SECRET,
  GITHUB_OAUTH_CLIENT_ID: env.GITHUB_OAUTH_CLIENT_ID,
  GITHUB_OAUTH_CLIENT_SECRET: env.GITHUB_OAUTH_CLIENT_SECRET,

  ai: {
    modelProvider: env.AI_MODEL_PROVIDER,
    /** Max number of previous messages to include in the LLM context (default 40 ≈ 20 exchanges) */
    maxContextMessages: env.AI_MAX_CONTEXT_MESSAGES,
    aiGateway: {
      accountId: env.CF_AI_GATEWAY_ACCOUNT_ID,
      name: env.CF_AI_GATEWAY_NAME,
    },
    openai: {
      apiKey: env.OPENAI_API_KEY,
      // https://platform.openai.com/docs/models/overview
      model: env.OPENAI_MODEL_NAME,
    },
    ollama: {
      baseUrl: env.OLLAMA_BASE_URL,
      // https://ollama.com/library
      model: env.OLLAMA_MODEL_NAME,
    },
    anthropic: {
      apiKey: env.ANTHROPIC_API_KEY,
      // https://docs.anthropic.com/en/docs/about-claude/models#model-names
      model: env.ANTHROPIC_MODEL_NAME,
    },
    google: {
      apiKey: env.GOOGLE_GEN_API_KEY,
      // https://ai.google.dev/gemini-api/docs/models
      model: env.GOOGLE_GEN_MODEL_NAME,
    },
  },
  email: {
    resendApiKey: env.RESEND_API_KEY,
    audienceId: env.RESEND_AUDIENCE_ID,
    defaultFrom: 'Altair GraphQL <mail@mail.altairgraphql.dev>',
    replyTo: 'info@altairgraphql.dev',
  },
  rateLimit: {
    // Default: 60 requests per 60 seconds per IP
    ttl: env.RATE_LIMIT_TTL,
    limit: env.RATE_LIMIT_MAX,
  },
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    checkoutSuccessUrl: env.STRIPE_CHECKOUT_SUCCESS_URL,
    checkoutCancelUrl: env.STRIPE_CHECKOUT_CANCEL_URL,
  },
};

export type Config = typeof config;
export type NestConfig = Config['nest'];
export type SwaggerConfig = Config['swagger'];
export type SecurityConfig = Config['security'];
export type CorsConfig = Config['cors'];
export type RateLimitConfig = Config['rateLimit'];

export default () => config;
