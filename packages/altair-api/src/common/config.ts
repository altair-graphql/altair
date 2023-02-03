const config = {
  nest: {
    port: 5000,
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
    expiresIn: '1d',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
};

type Config = typeof config;
export type NestConfig = Config['nest'];
export type SwaggerConfig = Config['swagger'];
export type SecurityConfig = Config['security'];
export type CorsConfig = Config['cors'];

export default () => config;
