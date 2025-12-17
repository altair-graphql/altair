import { z } from 'zod/v4';
import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'codemirror-json-schema';
import { settingsSchema } from 'altair-graphql-core/build/types/state/settings.schema';

export const getEditorExtensions = () => {
  return [jsonSchema(z.toJSONSchema(settingsSchema) as JSONSchema7)];
};
