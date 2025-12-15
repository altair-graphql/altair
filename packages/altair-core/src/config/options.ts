import { input } from 'zod/v4';
import {
  altairConfigOptionsSchema,
  altairWindowOptionsSchema,
} from './options.schema';

export type AltairWindowOptions = input<typeof altairWindowOptionsSchema>;

export type AltairConfigOptions = input<typeof altairConfigOptionsSchema>;
