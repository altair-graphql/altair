import { z } from 'zod';

const aiModelProviderSchema = z.enum([
  'anthropic',
  'openai',
  'google',
  'ollama',
  'fake',
]);

export type AiModelProvider = z.infer<typeof aiModelProviderSchema>;

/**
 * Zod schema for all environment variables consumed across the API.
 * Validates and provides type-safe defaults at startup.
 *
 * Variables marked as `.min(1)` are required — the app will crash or
 * silently malfunction without them.  Validation is skipped when
 * `NODE_ENV=test` so unit tests can run without a full `.env` file.
 */
const envSchema = z.object({
  NODE_ENV: z.string().optional().default('development'),
  PORT: z.coerce.number().int().positive().optional(),

  // Allowed redirect origins (comma-separated)
  ALLOWED_REDIRECT_ORIGINS: z
    .string()
    .optional()
    .default('https://altairgraphql.dev'),

  // ── Auth (required) ────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  EVENTS_JWT_ACCESS_SECRET: z.string().min(1),

  // ── OAuth (required) ───────────────────────────────────────────────
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1),
  GITHUB_OAUTH_CLIENT_ID: z.string().min(1),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().min(1),

  // ── AI / LLM ──────────────────────────────────────────────────────
  AI_MODEL_PROVIDER: aiModelProviderSchema.optional(),
  AI_MAX_CONTEXT_MESSAGES: z.coerce.number().int().positive().optional().default(40),

  // Cloudflare AI Gateway
  CF_AI_GATEWAY_ACCOUNT_ID: z.string().optional(),
  CF_AI_GATEWAY_NAME: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL_NAME: z.string().optional().default('gpt-3.5-turbo-0125'),

  // Ollama
  OLLAMA_BASE_URL: z.string().optional(),
  OLLAMA_MODEL_NAME: z.string().optional().default('llama3'),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL_NAME: z.string().optional().default('claude-3-haiku-20240307'),

  // Google Generative AI
  GOOGLE_GEN_API_KEY: z.string().optional(),
  GOOGLE_GEN_MODEL_NAME: z
    .string()
    .optional()
    .default('gemini-2.5-flash-preview-04-17'),

  // ── Email (Resend) ────────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
  RESEND_AUDIENCE_ID: z.string().optional(),

  // prod: smtp.resend.com
  SMTP_HOST: z.string(),
  // prod: 465
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  // prod: true
  SMTP_SECURE: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  // prod: resend
  SMTP_USER: z.string(),
  // prod: re_xxxxxxxxx
  SMTP_PASS: z.string(),

  // ── Rate limiting ─────────────────────────────────────────────────
  RATE_LIMIT_TTL: z.coerce.number().int().positive().optional().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().optional().default(60),

  // ── Stripe (required) ─────────────────────────────────────────────
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_CHECKOUT_SUCCESS_URL: z
    .string()
    .optional()
    .default(
      'https://altairgraphql.dev/checkout_success?session_id={CHECKOUT_SESSION_ID}'
    ),
  STRIPE_CHECKOUT_CANCEL_URL: z
    .string()
    .optional()
    .default(
      'https://altairgraphql.dev/checkout_cancel?session_id={CHECKOUT_SESSION_ID}'
    ),

  // ── New Relic ─────────────────────────────────────────────────────
  NEW_RELIC_APP_NAME: z.string().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;

/**
 * Validated, type-safe environment variables.
 *
 * Parsing happens once at module load time. If any value violates its schema
 * the process will throw immediately with a descriptive error.
 *
 * Validation is skipped when `NODE_ENV=test` so unit tests can run without
 * providing every required secret.
 */
export const env = parseEnv();

function parseEnv(): EnvSchema {
  const skipValidation = process.env.NODE_ENV === 'test';

  if (skipValidation) {
    // In test mode, we use mock values for required envs to ensure type safety
    // and allow tests to run without a full .env file.
    const mockEnvs = {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? 'test',
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'test-secret',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'test-secret',
      EVENTS_JWT_ACCESS_SECRET:
        process.env.EVENTS_JWT_ACCESS_SECRET ?? 'test-secret',
      GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID ?? 'test-id',
      GOOGLE_OAUTH_CLIENT_SECRET:
        process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? 'test-secret',
      GITHUB_OAUTH_CLIENT_ID: process.env.GITHUB_OAUTH_CLIENT_ID ?? 'test-id',
      GITHUB_OAUTH_CLIENT_SECRET:
        process.env.GITHUB_OAUTH_CLIENT_SECRET ?? 'test-secret',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? 'sk_test_mock',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_mock',
      SMTP_HOST: process.env.SMTP_HOST ?? 'localhost',
      SMTP_PORT: process.env.SMTP_PORT ?? '1026',
      SMTP_SECURE: process.env.SMTP_SECURE ?? 'false',
      SMTP_USER: process.env.SMTP_USER ?? '',
      SMTP_PASS: process.env.SMTP_PASS ?? '',
    };
    // In test mode, parse leniently — treat the whole schema as optional
    // so tests don't need a full .env file.
    return envSchema.parse(mockEnvs);
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      'Invalid environment variables:',
      result.error.flatten().fieldErrors
    );
    throw new Error('Invalid environment variables');
  }

  return result.data;
}
