import { json, jsonLanguage } from '@codemirror/lang-json';
import {
  Completion,
  CompletionContext,
  CompletionSource,
} from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import { getListNodeChildren } from '../../utils/editor/helpers';
import { getSchema } from '../../utils/json-schema';
import settingsSchema from '../../utils/settings.schema.json';
import { JSONSchema7 } from 'json-schema';
import { debug } from '../../utils/logger';
import { Diagnostic, linter, LintSource } from '@codemirror/lint';
import { jsonc } from '../../utils';
import settingsValidator from '../../utils/validate_settings_schema';
import { JSONCompletion } from './json-completion';

export const validateSettings = (settings: string) => {
  const data = jsonc(settings);
  const valid = settingsValidator(data);

  return valid;
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

          // TODO: Highlight only the relevant part instead of the whole text
          return {
            from: 0,
            to: text.length,
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
