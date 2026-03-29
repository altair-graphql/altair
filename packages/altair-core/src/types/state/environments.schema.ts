import { array, object, record, string, unknown } from 'zod/v4';

export const initialEnvironmentSchema = object({
  id: string().optional(),
  title: string().optional(),
  variables: record(string(), unknown()).optional(),
});

export const initialEnvironmentsSchema = object({
  activeSubEnvironment: string().optional(),
  base: initialEnvironmentSchema.optional(),
  subEnvironments: array(initialEnvironmentSchema).optional(),
});
