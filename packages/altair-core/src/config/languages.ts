import { z } from 'zod/v4';

const languages = {
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
export const languagesSchema = z.enum(languages);
