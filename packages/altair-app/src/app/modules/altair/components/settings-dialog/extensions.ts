import { CompletionContext } from '@codemirror/autocomplete';
import { json, jsonLanguage } from '@codemirror/lang-json';
import { Diagnostic, LintSource, linter } from '@codemirror/lint';
import { JSONSchema7 } from 'json-schema';
import { jsonc } from '../../utils';
import { getValueBoundariesInStringifiedJson } from '../../utils/json';
import { debug } from '../../utils/logger';
import settingsSchema from '../../utils/settings.schema.json';
import settingsValidator from '../../utils/validate_settings_schema';
import { JSONCompletion } from './json-completion';

export const validateSettings = (settings: string) => {
  const data = jsonc(settings);
  const valid = settingsValidator(data);

  return valid;
};

const findErrorValueBoundaries = (text: string, error: any) => {
  const errorPath = error.dataPath
    .split('.')
    .filter((segment: string) => segment.length > 0);

  return getValueBoundariesInStringifiedJson(
    text,
    errorPath[errorPath.length - 1]
  );
};

const settingsLintSource: LintSource = (view) => {
  let diagnostics: Diagnostic[] = [];
  const text = view.state.doc.toString();
  try {
    if (!validateSettings(text) && settingsValidator.errors) {
      diagnostics = diagnostics.concat(
        settingsValidator.errors.map((error) => {
          debug.log('settings lint error', error);
          let message = `[${error.keyword}] '${error.instancePath?.substring(
            1
          )}' ${error.message}`;

          if (error.params && error.params['allowedValues']) {
            message += `\nAllowed values: [${error.params['allowedValues'].join(
              ', '
            )}]`;
          }

          const erroredValueBoundaries = findErrorValueBoundaries(text, error);

          // TODO: Highlight only the relevant part instead of the whole text
          return {
            from: erroredValueBoundaries.start,
            to: erroredValueBoundaries.end,
            message,
            severity: 'error',
          };
        })
      );
    }
    // debug.log(valid, ajv.errors, text);
  } catch (error) {
    // debug.log(text, error);
    diagnostics.push({
      from: 0,
      to: text.length,
      message: 'Invalid JSON',
      severity: 'error',
    });
  }

  return diagnostics;
};

export const getEditorExtensions = () => {
  // TODO: Hint on hover

  const jsonCompletion = new JSONCompletion(settingsSchema as JSONSchema7);

  return [
    json(),
    jsonLanguage.data.of({
      autocomplete: (ctx: CompletionContext) => jsonCompletion.doComplete(ctx),
    }),
    linter(settingsLintSource),
  ];
};
