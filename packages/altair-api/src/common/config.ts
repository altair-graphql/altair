export type AiModelProvider = 'anthropic' | 'openai' | 'google' | 'ollama' | 'fake';

const config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: process.env.NODE_ENV !== 'production',
    title: 'Altair API',
    description: 'The Altair API description',
    version: '1.0',
    path: 'swagger',
  },
  allowedRedirectOrigins: (
    process.env.ALLOWED_REDIRECT_ORIGINS ?? 'https://altairgraphql.dev'
  ).split(','),
  security: {
    shortExpiresIn: '30s',
    expiresIn: '2d',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
  ai: {
    modelProvider: process.env.AI_MODEL_PROVIDER as AiModelProvider | undefined,
    aiGateway: {
      accountId: process.env.CF_AI_GATEWAY_ACCOUNT_ID,
      name: process.env.CF_AI_GATEWAY_NAME,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      // https://platform.openai.com/docs/models/overview
      model: process.env.OPENAI_MODEL_NAME ?? 'gpt-3.5-turbo-0125',
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL,
      // https://ollama.com/library
      model: process.env.OLLAMA_MODEL_NAME ?? 'llama3',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      // https://docs.anthropic.com/en/docs/about-claude/models#model-names
      model: process.env.ANTHROPIC_MODEL_NAME ?? 'claude-3-haiku-20240307',
    },
    google: {
      apiKey: process.env.GOOGLE_GEN_API_KEY,
      // https://ai.google.dev/gemini-api/docs/models
      model: process.env.GOOGLE_GEN_MODEL_NAME ?? 'gemini-2.5-flash-preview-04-17',
    },
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    audienceId: process.env.RESEND_AUDIENCE_ID,
    defaultFrom: 'Altair GraphQL <mail@mail.altairgraphql.dev>',
    replyTo: 'info@altairgraphql.dev',
  },
  stripe: {
    checkoutSuccessUrl:
      process.env.STRIPE_CHECKOUT_SUCCESS_URL ??
      'https://altairgraphql.dev/checkout_success?session_id={CHECKOUT_SESSION_ID}',
    checkoutCancelUrl:
      process.env.STRIPE_CHECKOUT_CANCEL_URL ??
      'https://altairgraphql.dev/checkout_cancel?session_id={CHECKOUT_SESSION_ID}',
  },
};

export type Config = typeof config;
export type NestConfig = Config['nest'];
export type SwaggerConfig = Config['swagger'];
export type SecurityConfig = Config['security'];
export type CorsConfig = Config['cors'];

export default () => config;
