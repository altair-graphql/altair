import * as Codemirror from 'codemirror';
import { jsonc } from '../utils';
import { debug } from './logger';
import { ValidateFunction } from 'ajv';
import { JSONSchema6 } from 'json-schema';

const settingsValidator = require('./validate_settings_schema') as ValidateFunction;

export interface SchemaFormProperty extends JSONSchema6 {
  ref?: any; // TODO:
  refType?: string;
}

export const settingsSchema = settingsValidator.schema;
export const validateSettings = (settings: string) => {
  const data = jsonc(settings);
  const valid = settingsValidator(data);

  return valid;
};

export const registerSettingsLinter = (CM: typeof Codemirror) => {
  CM.registerHelper('lint', 'json', function(text: string) {
    let found: any[] = [];
    try {
      if (!validateSettings(text) && settingsValidator.errors) {
        found = [
          ...found,
          ...settingsValidator.errors.map((error: any) => {
            let message = `[${error.keyword}] '${error.dataPath.substring(1)}' ${error.message}`;

            if (error.params && error.params['allowedValues']) {
              message += `\nAllowed values: [${error.params['allowedValues'].join(', ')}]`
            }
            return {
              from: CM.Pos(1, 1),
              to: CM.Pos(1, 1),
              message: message
            }
          })
        ];
      }
      // debug.log(valid, ajv.errors, text);
    } catch (error) {
      debug.log(text, error);
      found.push({
        from: CM.Pos(1, 1),
        to: CM.Pos(1, 1),
        message: 'Invalid JSON'
      });
    }

    return found;
  });
};

function elt(tagname: string, cls: string, ...elts: any[]) {
  const e = document.createElement(tagname);
  if (cls) {
    e.className = cls;
  }
  elts.forEach((_elt => {
    if (typeof _elt === 'string') {
      _elt = document.createTextNode(_elt);
    }
    e.appendChild(_elt);
  }));
  return e;
}

function makeTooltip(x: number, y: number, content: string) {
  const node = elt('div', 'CodeMirror-Tern-tooltip', content);
  node.style.left = x + 'px';
  node.style.top = y + 'px';
  document.body.appendChild(node);
  return node;
}

function remove(node: Node) {
  const p = node && node.parentNode;
  if (p) {
    p.removeChild(node);
  }
}

export const getPropertyRef = (property: SchemaFormProperty, schema: JSONSchema6) => {
  if (property.$ref) {
    const refPath = property.$ref.split('/');
    let curRef: any = schema;
    refPath.forEach(path => {
      if (path === '#') {
        curRef = schema;
      } else {
        if (curRef) {
          curRef = curRef[path] as JSONSchema6 | undefined;
        }
      }
    });

    return curRef as JSONSchema6 | undefined;
  }
};

function getPropertyType(property: any, schema: any) {
  if (property.type) {
    return property.type;
  }
  return getPropertyRef(property, schema)?.type;
}

export const getHint = (cm: CodeMirror.Editor) => {
  const cursor = cm.getDoc().getCursor(); // TODO: Check that still works properly
  const token: Codemirror.Token = cm.getTokenAt(cursor);
  const start: number = token.start;
  const end: number = cursor.ch;
  const line: number = cursor.line;
  const currentWord: string = token.string;

  let before = '';
  let after = '';

  // Only show hint if token is a property of the object (not for values)
  if (token.type !== 'string property') {
    return null;
  }
  if (typeof settingsValidator.schema !== 'object') {
    return null;
  }
  if (token.state.lastType === 'string') {
    before = currentWord.substr(0, 1);
    after = currentWord.substr(-1, 1);
  }

  const schemaProperties = (settingsValidator.schema as any).properties;
  const fullList = Object.keys(schemaProperties)
    .map(item => ({
      ...schemaProperties[item],
      text: `${before}${item}${after}`,
      displayText: item,
      description: schemaProperties[item].description
        + '\nType: ' + getPropertyType(schemaProperties[item], settingsValidator.schema)
    }));
  const list = fullList
    .filter(item => item.displayText.indexOf(currentWord.replace(new RegExp(`(^${before})|(${after}$)`, 'g'), '')) > -1);

  const hintResult = {
    list: list.length ? list : fullList,
    from: Codemirror.Pos(line, start),
    to: Codemirror.Pos(line, token.end)
  };
  let tooltip: HTMLElement;
  Codemirror.on(hintResult, 'close', function() { remove(tooltip); });
  Codemirror.on(hintResult, 'update', function() { remove(tooltip); });
  Codemirror.on(hintResult, 'select', function(cur: any, node: Node) {
    remove(tooltip);
    const content = cur.description;
    if (content && node.parentElement) {
      tooltip = makeTooltip(
        node.parentElement.getBoundingClientRect().right + window.pageXOffset,
        node.parentElement.getBoundingClientRect().top + window.pageYOffset,
        content,
      );
      if (tooltip) {
        tooltip.className += ' ' + 'CodeMirror-Tern-hint-doc';
      }
    }
  });

  return hintResult;
};
