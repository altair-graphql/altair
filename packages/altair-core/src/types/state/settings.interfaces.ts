import { output } from 'zod/v4';
import { settingsSchema } from './settings.schema';

export type SettingsState = output<typeof settingsSchema>;

// Partial settings state for generating partial validator
type PartialSettingsState = Partial<SettingsState>;
