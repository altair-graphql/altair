import { output } from 'zod/v4';
import { languagesEnum } from '../../config/languages';
import { settingsSchema } from './settings.schema';

export type SettingsLanguage = (typeof languagesEnum)[keyof typeof languagesEnum];

export type SettingsState = output<typeof settingsSchema>;

// Partial settings state for generating partial validator
type PartialSettingsState = Partial<SettingsState>;
