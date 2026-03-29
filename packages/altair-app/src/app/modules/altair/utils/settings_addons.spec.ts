import {
  validateSettings,
  getSchemaFormProperty,
  getPropertyRef,
  getPropertyType,
} from './settings_addons';
import { jsonc } from './index';

describe('getSchemaFormProperty', () => {
  it('should return property with key for non-object schema', () => {
    const result = getSchemaFormProperty('testKey', { type: 'string' } as any);
    expect(result.key).toBe('testKey');
  });

  it('should return property with all fields for object schema', () => {
    const schema: any = {
      type: 'string',
      description: 'A test string',
      properties: {
        name: { type: 'string' },
      },
    };
    const result = getSchemaFormProperty('testKey', schema);
    expect(result.key).toBe('testKey');
    expect(result.type).toBe('string');
    expect(result.description).toBe('A test string');
  });

  it('should handle $ref in schema', () => {
    const schema: any = {
      type: 'string',
      $ref: '#/properties/name',
      properties: {
        name: { type: 'string', enum: ['value1', 'value2'] },
      },
    };
    const result = getSchemaFormProperty('testKey', schema);
    expect(result.$ref).toBe('#/properties/name');
    expect(result.ref).toBeDefined();
    expect(result.refType).toBe('enum.string');
  });

  it('should handle $ref without enum', () => {
    const schema: any = {
      type: 'string',
      $ref: '#/properties/name',
      properties: {
        name: { type: 'string' },
      },
    };
    const result = getSchemaFormProperty('testKey', schema);
    expect(result.refType).toBeUndefined();
  });
});

describe('getPropertyRef', () => {
  it('should return undefined if no $ref', () => {
    const property: any = { key: 'test' };
    const result = getPropertyRef(property, {});
    expect(result).toBeUndefined();
  });

  it('should resolve $ref correctly', () => {
    const schema: any = {
      properties: {
        name: { type: 'string', enum: ['a', 'b'] },
      },
    };
    const property: any = { key: 'test', $ref: '#/properties/name' };
    const result = getPropertyRef(property, schema);
    expect(result).toEqual({ type: 'string', enum: ['a', 'b'] });
  });

  it('should handle nested $ref paths', () => {
    const schema: any = {
      definitions: {
        nested: {
          type: 'string',
        },
      },
    };
    const property: any = { key: 'test', $ref: '#/definitions/nested' };
    const result = getPropertyRef(property, schema);
    expect(result).toEqual({ type: 'string' });
  });

  it('should return undefined for invalid ref path', () => {
    const schema: any = { properties: {} };
    const property: any = { key: 'test', $ref: '#/invalid/path' };
    const result = getPropertyRef(property, schema);
    expect(result).toBeUndefined();
  });
});

describe('getPropertyType', () => {
  it('should return type if property has type', () => {
    const result = getPropertyType({ type: 'string' }, {});
    expect(result).toBe('string');
  });

  it('should get type from ref if property has no type', () => {
    const schema: any = {
      properties: {
        name: { type: 'string' },
      },
    };
    const property: any = { $ref: '#/properties/name' };
    const result = getPropertyType(property, schema);
    expect(result).toBe('string');
  });

  it('should return undefined if no type or ref', () => {
    const result = getPropertyType({}, {});
    expect(result).toBeUndefined();
  });
});
