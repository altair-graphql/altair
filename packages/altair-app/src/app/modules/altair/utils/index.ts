const toSnakeCase = require('to-snake-case'); // TODO: Check that this still works
import FileSaver from 'file-saver';
const commentRegex = require('comment-regex');
const validUrl = require('valid-url');
import isElectron from 'altair-graphql-core/build/utils/is_electron';
import { debug } from './logger';
import { IDictionary } from '../interfaces/shared';
import fileDialog from 'file-dialog';
import { VARIABLE_REGEX } from '../services/environment/environment.service';

/**
 * Download the specified data with the provided options
 * @param data data string to download
 * @param fileName name of downloaded file
 * @param opts configuration options
 */
export const downloadData = (
  data: string,
  fileName = 'data',
  {
    mimeType = 'text/plain',
    dataUriAttr = 'text/plain;charset=utf-8',
    fileType = 'txt'
  } = {}) => {

  const dataStr = `data:${dataUriAttr},${data}`;
  const fileNameWithExt = `${toSnakeCase(fileName)}.${fileType}`;
  const fileBlob = new Blob([data], {type: dataUriAttr});
  FileSaver.saveAs(fileBlob, fileNameWithExt);
};

/**
 * Download an object as a JSON file
 * @param obj The object to be downloaded
 * @param fileName The name the file will be called
 */
export const downloadJson = (obj: any, fileName = 'response', opts: any = undefined) => {
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
export const getFileStr = (files: FileList) => {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = function (e: any) {
      const contents: string = e.target.result;

      // Resolve file content
      resolve(contents);
    };
    fileReader.readAsText(files[0]);
  });
};
interface FileDialogOptions {
  readonly multiple?: boolean;
  readonly accept?: string|ReadonlyArray<string>;
}
export const openFile = async (opts: FileDialogOptions = {}) => {
  try {
    const files = await fileDialog(opts);
    return getFileStr(files);
  } catch (err) {
    debug.log('There was an issue while opening the file: ', err);
  }
};

export const getFileContent = async (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = function (e: any) {
      const contents: string = e.target.result;

      // Resolve file content
      resolve(contents);
    };
    fileReader.readAsText(file);
  })
}

export const openFiles = async (opts: FileDialogOptions = {}) => {
  try {
    const files = await fileDialog({ ...opts, multiple: true });

    return Promise.all([...files].map((file) => getFileContent(file)));
  } catch (err) {
    debug.log('There was an issue while opening the files: ', err);

    return Promise.all([]);
  }
};

export const isExtension = !!((window as any).chrome && (window as any).chrome.runtime && (window as any).chrome.runtime.id);
export const isFirefoxExtension = !!((window as any).chrome && (window as any).chrome.geckoProfiler);

export const detectEnvironment = () => {
  if (isElectron) {
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

export const copyToClipboard = (str: string) => {
  const el = document.createElement('textarea');  // Create a <textarea> element
  el.value = str;                                 // Set its value to the string that you want copied
  el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  el.style.position = 'absolute';
  el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  const documentSelection = document.getSelection();
  const selected =
    documentSelection && documentSelection.rangeCount > 0        // Check if there is any content selected previously
      ? documentSelection.getRangeAt(0)     // Store selection if found
      : false;                                    // Mark as false to know no selection existed before
  el.select();                                    // Select the <textarea> content
  document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);                  // Remove the <textarea> element
  if (selected && documentSelection) {                                 // If a selection existed before copying
    documentSelection.removeAllRanges();    // Unselect everything on the HTML document
    documentSelection.addRange(selected);   // Restore the original selection
  }
};

export const getFullUrl = (url: string) => {
  if (!url) {
    return url;
  }

  // regex to test if given string is an environment variable
  if (VARIABLE_REGEX.test(url)) {
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
  obj: IDictionary,
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

export function truncateText(text: string, maxLength = 70) {
  let appendEllipsis = false;
  if (text.length > maxLength) {
    appendEllipsis = true;
  }

  return text.substring(0, maxLength) + (appendEllipsis ? '...' : '');
}

export const externalLink = (e: Event, url: string) => {
  e.preventDefault();

  // If electron app
  if ((window as any).process && (window as any).process.versions.electron) {
    const electron = (window as any).require('electron');
    electron.shell.openExternal(url);
  } else {
    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  }
}