import { jsonSchema } from 'codemirror-json-schema';

export const gqlVariables = () => {
  return [
    // start with an empty schema
    jsonSchema({
      type: 'object',
      properties: {},
    }),
  ];
};
