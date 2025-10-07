import { ExportCollectionState } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { ExportEnvironmentState } from 'altair-graphql-core/build/types/state/environments.interfaces';
import { ExportWindowState } from 'altair-graphql-core/build/types/state/window.interfaces';

export type AltairFile =
  | ExportWindowState
  | ExportCollectionState
  | ExportEnvironmentState;

export const ALTAIR_FILE_EXTENSIONS = {
  QUERY: 'agq',
  COLLECTION: 'agc',
  ENVIRONMENT: 'agx',
  BACKUP: 'agbkp',
} as const;

export type AltairFileExtension =
  (typeof ALTAIR_FILE_EXTENSIONS)[keyof typeof ALTAIR_FILE_EXTENSIONS];
export type SupportedFileExtensions = AltairFileExtension | 'json' | 'txt' | 'gql';
