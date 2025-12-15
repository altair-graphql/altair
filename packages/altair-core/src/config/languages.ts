import { z } from 'zod/v4';

export const languagesEnum = {
  TranslationLang: 'ach-UG',
  English: 'en-US',
  French: 'fr-FR',
  Español: 'es-ES',
  Czech: 'cs-CZ',
  German: 'de-DE',
  Brazilian: 'pt-BR',
  Russian: 'ru-RU',
  Ukrainian: 'uk-UA',
  'Chinese Simplified': 'zh-CN',
  Japanese: 'ja-JP',
  Serbian: 'sr-SP',
  Italian: 'it-IT',
  Polish: 'pl-PL',
  Korean: 'ko-KR',
  Romanian: 'ro-RO',
  Vietnamese: 'vi-VN',
} as const;
// Flip the key-value pairs.
// TODO: We can consider updating all usage to use the above format instead.
export const languages = Object.entries(languagesEnum).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<string, string>
);
export const languagesSchema = z.enum(languagesEnum);
