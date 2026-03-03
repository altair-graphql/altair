import { buildSchema } from 'graphql';
import { testSdl } from './test-sdl';

export const getTestSchema = () => {
  return buildSchema(testSdl);
};
