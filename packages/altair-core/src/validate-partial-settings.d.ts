import { ValidateFunction } from 'ajv';
import { SettingsState } from './types/state/settings.interfaces';
declare let v: ValidateFunction<Partial<SettingsState>>;
export default v;
