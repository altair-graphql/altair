import * as Codemirror from 'codemirror';
import { jsonc } from '../utils';
import { debug } from './logger';

const settingsValidator = require('./validate_settings_schema');

export const validateSettings = settings => {
  const data = jsonc(settings);
  const valid = settingsValidator(data);

  return valid;
};

export const registerSettingsLinter = CM => {
  CM.registerHelper('lint', 'json', function(text) {
    let found = [];
    try {
      if (!validateSettings(text)) {
        found = [
          ...found,
          ...settingsValidator.errors.map(error => {
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
      // console.log(valid, ajv.errors, text);
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

function elt(tagname, cls, ...elts) {
  const e = document.createElement(tagname);
  if (cls) {
    e.className = cls;
  }
  for (let i = 2; i < arguments.length; ++i) {
    let _elt = arguments[i];
    if (typeof _elt === 'string') {
      _elt = document.createTextNode(_elt);
    }
    e.appendChild(_elt);
  }
  return e;
}

function makeTooltip(x, y, content) {
  const node = elt('div', 'CodeMirror-Tern-tooltip', content);
  node.style.left = x + 'px';
  node.style.top = y + 'px';
  document.body.appendChild(node);
  return node;
}

function remove(node) {
  const p = node && node.parentNode;
  if (p) {
    p.removeChild(node);
  }
}

function getPropertyType(property, schema) {
  if (property.type) {
    return property.type;
  }
  if (property.$ref) {
    const refPath: any[] = property.$ref.split('/');
    let curRef = schema;
    refPath.forEach(path => {
      if (path === '#') {
        curRef = schema;
      } else {
        curRef = curRef[path];
      }
    });

    return curRef.type;
  }
}

export const getHint = (cm) => {
  const cursor = cm.getCursor();
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
  if (token.state.lastType === 'string') {
    before = currentWord.substr(0, 1);
    after = currentWord.substr(-1, 1);
  }
  const fullList = Object.keys(settingsValidator.schema.properties)
    .map(item => ({
      ...settingsValidator.schema.properties[item],
      text: `${before}${item}${after}`,
      displayText: item,
      description: settingsValidator.schema.properties[item].description
        + '\nType: ' + getPropertyType(settingsValidator.schema.properties[item], settingsValidator.schema)
    }));
  const list = fullList
    .filter(item => item.displayText.indexOf(currentWord.replace(new RegExp(`(^${before})|(${after}$)`, 'g'), '')) > -1);

  const hintResult = {
    list: list.length ? list : fullList,
    from: Codemirror.Pos(line, start),
    to: Codemirror.Pos(line, token.end)
  };
  let tooltip = null;
  Codemirror.on(hintResult, 'close', function() { remove(tooltip); });
  Codemirror.on(hintResult, 'update', function() { remove(tooltip); });
  Codemirror.on(hintResult, 'select', function(cur, node) {
    remove(tooltip);
    const content = cur.description;
    if (content) {
      tooltip = makeTooltip(node.parentNode.getBoundingClientRect().right + window.pageXOffset,
                            node.getBoundingClientRect().top + window.pageYOffset, content);
      tooltip.className += ' ' + 'CodeMirror-Tern-hint-doc';
    }
  });

  return hintResult;
};
