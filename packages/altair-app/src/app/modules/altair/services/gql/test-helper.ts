import { readFileSync } from 'fs';
import { buildSchema } from 'graphql';
import { resolve } from 'path';

export const getTestSchema = () => {
  const sdl = readFileSync(
    resolve(__dirname, '../../../../../../fixtures/test.sdl'),
    'utf8'
  );
  return buildSchema(sdl);
};
