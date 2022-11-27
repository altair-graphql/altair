import { json, jsonLanguage } from '@codemirror/lang-json';
import { Completion, CompletionSource } from '@codemirror/autocomplete';
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

// completable
// - property name (enumerate parent properties)
// - property value with enum
// - required, open object, array
const schemaCompletionSource: CompletionSource = (ctx) => {
  const word = ctx.matchBefore(/[A-Za-z0-9._]*/);
  const r = (node: SyntaxNode | null) =>
    node ? ctx.state.doc.sliceString(node.from, node.to) : '';
  const nodeBefore = syntaxTree(ctx.state).resolveInner(ctx.pos, -1);
  const curNodeText = r(nodeBefore);
  let from = word?.from || ctx.pos;
  let to = ctx.pos;
  let curNode = nodeBefore;
  const nodeValues = [{ type: curNode.name, val: r(curNode), listIdx: -1 }];
  while (curNode.parent) {
    const propertyNameNode = curNode.parent.getChild('PropertyName');
    let listIdx = -1;
    if (curNode.parent.name === 'Array') {
      const children = getListNodeChildren(curNode.parent);
      listIdx = children.findIndex(
        (c) => c.from === curNode.from && c.to === curNode.to
      );
    }
    const propertyName = r(propertyNameNode);
    nodeValues.push({
      type: curNode.parent.name,
      // trim quotes around string, since JSON property name is always quoted
      val: propertyName.replace(/(^['"]|['"]$)/g, ''),
      listIdx,
    });
    curNode = curNode.parent;
  }

  const x = [...nodeValues].reverse();
  const pathSegments = [];
  for (let i = 0; i < x.length; i++) {
    const curNodeVal = x[i];
    switch (curNodeVal.type) {
      case 'JsonText':
        continue;
      case 'Object':
        // for objects, look ahead for property name
        const nextNodeVal = x[i + 1];
        if (['Property', 'PropertyName'].includes(nextNodeVal?.type)) {
          pathSegments.push({ type: 'PropertyName', val: nextNodeVal.val });
        }
        // increment i since we are consuming the next node val here as well
        i++;
        continue;
      case 'Array':
        // set the index of the node val
        pathSegments.push({ type: 'Array', val: curNodeVal.listIdx });
      default:
    }
  }

  // if the last path segment matches the current node, remove it from the path segment
  // REASONING: We cannot autocomplete the current node by looking at its schema.
  // We need to look at the parent to autocomplete to the current node or its siblings.
  if (pathSegments[0]?.type === nodeBefore.name) {
    pathSegments.pop();
  }
  const subSchema = getSchema(
    settingsSchema as JSONSchema7,
    pathSegments.map((_) => _.val)
  );
  const schemaProperties =
    typeof subSchema === 'object' ? subSchema.properties : undefined;
  debug.log('...', nodeBefore, x, pathSegments, subSchema, ctx.pos);

  let options: Completion[] = [];

  // autocomplete property name
  if (nodeBefore.name === 'PropertyName' && schemaProperties) {
    options = Object.keys(schemaProperties).map((propName): Completion => {
      const sch = schemaProperties[propName];
      const description = typeof sch === 'object' ? sch.description || '' : '';
      const type = typeof sch === 'object' ? sch.type || '' : '';
      const typeStr = Array.isArray(type) ? type.toString() : type;
      return {
        label: propName,
        info: description,
        detail: typeStr,
      };
    });
  }

  const isInStringValue =
    nodeBefore.name === 'String' &&
    nodeBefore.from <= ctx.pos &&
    nodeBefore.to > ctx.pos; // cur pos is not outside string
  const isUnclosedStringValue =
    nodeBefore.type.isError &&
    nodeBefore.prevSibling?.name === 'PropertyName' &&
    /^"[^"]*$/.test(curNodeText); // unclosed string
  if (
    (isInStringValue || isUnclosedStringValue) &&
    typeof subSchema === 'object' &&
    subSchema.enum?.length
  ) {
    // start from the found node
    from = nodeBefore.from;
    to = isInStringValue ? ctx.pos + 1 : ctx.pos;
    options = subSchema.enum.map((val): Completion => {
      const description = val?.toString();
      const type = subSchema.type;
      const typeStr = Array.isArray(type) ? type.toString() : type;
      const label = val?.toString() || '';
      return {
        label: `"${label}"`,
        info: description,
        detail: typeStr,
      };
    });
  }

  if (options.length) {
    return {
      from,
      to,
      options,
    };
  }
  return null;
};

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
          let message = `[${error.keyword}] '${(
            error as any
          ).dataPath?.substring(1)}' ${error.message}`;

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

  return [
    json(),
    jsonLanguage.data.of({
      autocomplete: schemaCompletionSource,
    }),
    linter(settingsLintSource),
  ];
};
