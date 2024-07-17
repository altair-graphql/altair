export type AiModelProvider = 'anthropic' | 'openai' | 'ollama';

const config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: 'Altair API',
    description: 'The Altair API description',
    version: '1.0',
    path: 'swagger',
  },
  security: {
    shortExpiresIn: '30s',
    expiresIn: '2d',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
  ai: {
    modelProvider: process.env.AI_MODEL_PROVIDER as AiModelProvider | undefined,
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
  },
};

export type Config = typeof config;
export type NestConfig = Config['nest'];
export type SwaggerConfig = Config['swagger'];
export type SecurityConfig = Config['security'];
export type CorsConfig = Config['cors'];

export default () => config;
