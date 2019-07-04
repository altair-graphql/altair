import * as toSnakeCase from 'to-snake-case';
import * as FileSaver from 'file-saver';
import * as commentRegex from 'comment-regex';
import * as validUrl from 'valid-url';
import is_electron from './is_electron';
import { debug } from './logger';
const fileDialog = require('file-dialog');

/**
 * Download the specified data with the provided options
 * @param data data string to download
 * @param fileName name of downloaded file
 * @param opts configuration options
 */
export const downloadData = (data, fileName = 'data', opts = undefined) => {
  let _opts = {
    mimeType: 'text/plain',
    dataUriAttr: 'text/plain;charset=utf-8',
    fileType: 'txt'
  };

  if (opts) {
    _opts = { ..._opts, ...opts };
  }

  const dataStr = `data:${_opts.dataUriAttr},${data}`;
  const fileNameWithExt = `${toSnakeCase(fileName)}.${_opts.fileType}`;
  const fileBlob = new Blob([data], {type: _opts.dataUriAttr});
  FileSaver.saveAs(fileBlob, fileNameWithExt);
};

/**
 * Download an object as a JSON file
 * @param obj The object to be downloaded
 * @param fileName The name the file will be called
 */
export const downloadJson = (obj, fileName = 'response', opts = undefined) => {
  let _opts = {
    mimeType: 'text/json',
    dataUriAttr: 'text/json;charset=utf-8',
    fileType: 'json'
  };

  if (opts) {
    _opts = { ..._opts, ...opts };
  }

  const dataStr = JSON.stringify(obj);
  downloadData(dataStr, fileName, _opts);
};

/**
 * Get file data as string
 * @param files FileList object
 */
export const getFileStr = files => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = function (e: any) {
      const contents: string = e.target.result;

      // Resolve file content
      resolve(contents);
    };
    fileReader.readAsText(files[0]);
  });
};

export const openFile = (...args) => {
  return fileDialog(...args).then(getFileStr).catch(err => {
    debug.log('There was an issue while opening the file: ', err);
  });
}

export const isExtension = !!(window['chrome'] && window['chrome'].runtime && window['chrome'].runtime.id);
export const isFirefoxExtension = !!(window['chrome'] && window['chrome']['geckoProfiler']);

export const detectEnvironment = () => {
  if (is_electron) {
    return 'electron';
  }

  if (isExtension) {
    if (isFirefoxExtension) {
      return 'firefox-extension';
    } else {
      return 'chrome-extension'
    }
  }

  if (/http/.test(location.protocol)) {
    return 'web-app';
  }

  return 'other';
};

/**
 * Parse JSON with comments
 * @param str
 */
export const jsonc = (str: string) => {
  str = str.trim();
  str = str.replace(commentRegex(), '');

  if (!str) {
    return {};
  }
  return JSON.parse(str);
};

export const copyToClipboard = str => {
  const el = document.createElement('textarea');  // Create a <textarea> element
  el.value = str;                                 // Set its value to the string that you want copied
  el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  el.style.position = 'absolute';
  el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  const selected =
    document.getSelection().rangeCount > 0        // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0)     // Store selection if found
      : false;                                    // Mark as false to know no selection existed before
  el.select();                                    // Select the <textarea> content
  document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);                  // Remove the <textarea> element
  if (selected) {                                 // If a selection existed before copying
    document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
    document.getSelection().addRange(selected);   // Restore the original selection
  }
};

export const getFullUrl = (url: string) => {
  if (!url) {
    return url;
  }

  if (!validUrl.isUri(url)) {
    if (url.trim() === '*') {
      return location.href;
    }

    if (url.substr(0, 1) === '/') {
      url = url.substr(1);
    }
    return location.origin + '/' + url;
  }

  return url;
};

export function parseDotNotationKey(key: string) {
  const intKey = parseInt(key, 10);
  return intKey.toString() === key
    ? intKey
    : key;
}

/**
 * Sets value to object using dot notation.
 * @param obj Object to set the value to.
 * @param path Path as a string, separated by dots.
 * @param value Any value to be set.
 * @example
 * ```ts
 * const obj = { a: 1, b: { c: 2 } };
 * setByDotNotation(obj, "b.d.e.0", 3);
 * // results in
 * { a: 1, b: { c: 2, d: { e: [3] } } };
 * ```
 */
export function setByDotNotation<TResult = any>(
  obj: object,
  path: Array<number | string> | number | string,
  value: TResult,
): TResult | undefined {
  if (typeof path === 'number') {
    path = [path];
  }
  if (!path || path.length === 0) {
    return undefined;
  }
  if (typeof path === 'string') {
    return setByDotNotation(obj, path.split('.').map(parseDotNotationKey), value);
  }

  const currentPath = path[0];
  const currentValue = obj[currentPath];

  if (path.length === 1) {
    obj[currentPath] = value;
    return currentValue;
  }

  if (currentValue === undefined) {
    if (typeof path[1] === 'number') {
      obj[currentPath] = [];
    } else {
      obj[currentPath] = {};
    }
  }

  return setByDotNotation(obj[currentPath], path.slice(1), value);
}
