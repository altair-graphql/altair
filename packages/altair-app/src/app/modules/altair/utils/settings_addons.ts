import { jsonc } from '../utils';
import { JSONSchema6, JSONSchema6Definition } from 'json-schema';
import settingsValidator from 'altair-graphql-core/build/typegen/validate-settings';
import { debug } from './logger';

export interface SchemaFormProperty extends JSONSchema6 {
  key: string;
  ref?: JSONSchema6; // TODO:
  refType?: string;
}

export const settingsSchema = settingsValidator.schema;
export const validateSettings = (settings: string) => {
  const data = jsonc(settings);
  const valid = settingsValidator(data);
  if (!valid) {
    debug.log('validator errors', settingsValidator.errors);
  }

  return valid;
};

export const getSchemaFormProperty = (
  key: string,
  schema: JSONSchema6Definition
) => {
  if (typeof schema !== 'object') {
    return { key };
  }
  const pty: SchemaFormProperty = { ...schema, key };
  if (pty.$ref) {
    pty.ref = getPropertyRef(pty, schema);
    if (pty.ref && pty.ref.enum) {
      pty.refType = `enum.${pty.ref.type}`;
    }
  }
  return pty;
};

export const getPropertyRef = (
  property: SchemaFormProperty,
  schema: JSONSchema6
) => {
  if (!property.$ref) {
    return;
  }
  const refPath = property.$ref.split('/');
  let curRef: any = schema;
  refPath.forEach((path) => {
    if (path === '#') {
      curRef = schema;
    } else {
      if (curRef) {
        curRef = curRef[path] as JSONSchema6 | undefined;
      }
    }
  });

  return curRef as JSONSchema6 | undefined;
};

export function getPropertyType(property: any, schema: any) {
  if (property.type) {
    return property.type;
  }
  return getPropertyRef(property, schema)?.type;
}
