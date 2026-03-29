import { languagesSchema } from './languages';

export const DEFAULT_OPTIONS = {
  DEFAULT_THEME: 'system',
  DEFAULT_LANGUAGE: languagesSchema.enum.English,
  ADD_QUERY_DEPTH_LIMIT: 3,
  TAB_SIZE: 2,
  THEMES: ['light', 'dark', 'dracula', 'system'],
} as const;
