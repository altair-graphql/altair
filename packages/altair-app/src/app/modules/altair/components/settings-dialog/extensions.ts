import settingsSchema from 'altair-graphql-core/build/typegen/settings.schema.json';
import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'codemirror-json-schema';

export const getEditorExtensions = () => {
  return [jsonSchema(settingsSchema as JSONSchema7)];
};
