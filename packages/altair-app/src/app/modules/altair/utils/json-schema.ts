import { JSONSchema7, JSONSchema7Definition } from 'json-schema';

export const getSchema = (
  schema: JSONSchema7,
  ptr: (string | number)[]
): JSONSchema7 | JSONSchema7Definition | undefined => {
  let curSchema: JSONSchema7 | JSONSchema7Definition | undefined = schema;
  ptr.forEach((cur) => {
    if (!cur) {
      return;
    }
    if (cur === '#') {
      curSchema = schema;
      return;
    }

    if (typeof curSchema === 'object') {
      switch (curSchema.type) {
        case 'object':
          curSchema = curSchema.properties?.[cur];
          return;
        case 'array':
          curSchema = Array.isArray(curSchema.items)
            ? curSchema.items[0]
            : curSchema.items;
          return;
        default:
          curSchema = undefined;
      }
    }
  });

  if (typeof curSchema === 'object') {
    return dereferenceSchema(curSchema, schema);
  }
  return curSchema;
};

const dereferenceSchema = (property: JSONSchema7Definition, schema: JSONSchema7) => {
  if (typeof property === 'object' && property.$ref) {
    const refPath = property.$ref.split('/');
    const refSchema = getReference(schema, refPath);
    if (typeof refSchema === 'object') {
      const dereferenced = {
        ...property,
        ...refSchema,
      };
      Reflect.deleteProperty(dereferenced, '$ref');

      return dereferenced;
    }
  }
  return property;
};
export const getReference = (schema: JSONSchema7, ptr: (string | number)[]) => {
  let curReference: Record<string, any> | undefined = schema;
  ptr.forEach((cur) => {
    if (!cur) {
      return;
    }
    if (cur === '#') {
      curReference = schema;
      return;
    }
    if (typeof curReference === 'object') {
      curReference = curReference[cur];
    }
  });

  return curReference;
};

export const getPropertyRef = (
  property: JSONSchema7Definition,
  schema: JSONSchema7
) => {
  if (typeof property === 'object' && property.$ref) {
    const refPath = property.$ref.split('/');
    return getReference(schema, refPath);
  }
  return;
};

// FIXME: Might be buggy. Still unused. Check before use.
export function getPropertyType(
  property: JSONSchema7Definition,
  schema: JSONSchema7
) {
  if (typeof property === 'object' && property.type) {
    return property.type;
  }
  const subSchema = getPropertyRef(property, schema);
  if (typeof subSchema === 'object') {
    return subSchema.type;
  }
  return;
}
