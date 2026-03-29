import FileSaver from 'file-saver';
import JSONBigint from 'json-bigint';
import isElectron from 'altair-graphql-core/build/utils/is_electron';
import { isExtension, isFirefoxExtension } from 'altair-graphql-core/build/crx';
import { debug } from './logger';
import { IDictionary } from '../interfaces/shared';
import fileDialog from 'file-dialog';
import { VARIABLE_REGEX } from '../services/environment/environment.service';
import { commentRegex } from './comment-regex';
import { from } from 'rxjs';
import { take } from 'rxjs/operators';
import { electronApiKey } from '@altairgraphql/electron-interop/build/constants';
import { SupportedFileExtensions } from '../services/files/types';

interface DownloadDataOptions {
  mimeType?: string;
  dataUriAttr?: string;
  fileType?: SupportedFileExtensions;
}

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
    fileType = 'txt',
  }: DownloadDataOptions = {}
) => {
  const dataStr = `data:${dataUriAttr},${data}`;
  const fileNameWithExt = `${toSnakeCase(fileName)}.${fileType}`;
  const fileBlob = new Blob([data], { type: dataUriAttr });
  FileSaver.saveAs(fileBlob, fileNameWithExt);
};

/**
 * Download an object as a JSON file
 * @param obj The object to be downloaded
 * @param fileName The name the file will be called
 */
export const downloadJson = (
  obj: unknown,
  fileName = 'response',
  opts?: DownloadDataOptions
) => {
  let _opts: DownloadDataOptions = {
    mimeType: 'text/json',
    dataUriAttr: 'text/json;charset=utf-8',
    fileType: 'json',
  };

  if (opts) {
    _opts = { ..._opts, ...opts };
  }

  const dataStr = JSON.stringify(obj);
  downloadData(dataStr, fileName, _opts);
};

const readFile = (file: File) => {
  return new Promise<string | ArrayBuffer | null | undefined>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => resolve(e.target?.result);
    fileReader.onerror = (e) => reject(e.target?.error);
    fileReader.readAsText(file);
  });
};

/**
 * Get file data as string
 * @param files FileList object
 */
export const getFileStr = async (file: File): Promise<string> => {
  const content = await readFile(file);

  if (content) {
    if (content instanceof ArrayBuffer) {
      const decoder = new TextDecoder();
      return decoder.decode(content);
    }

    return content;
  }

  return '';
};
interface FileDialogOptions {
  readonly multiple?: boolean;
  readonly accept?: string | ReadonlyArray<string>;
}
export const openFile = async (opts: FileDialogOptions = {}) => {
  try {
    const files = await fileDialog(opts);
    const file = files[0];
    if (file) {
      return getFileStr(file);
    }
    return '';
  } catch (err) {
    debug.log('There was an issue while opening the file: ', err);
    return '';
  }
};

export const openFiles = async (opts: FileDialogOptions = {}) => {
  try {
    const files = await fileDialog({ ...opts, multiple: true });

    return Promise.all([...files].map((file) => getFileStr(file)));
  } catch (err) {
    debug.log('There was an issue while opening the files: ', err);

    return Promise.all([]);
  }
};

export const detectEnvironment = () => {
  if (isElectron) {
    return 'electron';
  }

  if (isExtension) {
    if (isFirefoxExtension) {
      return 'firefox-extension';
    } else {
      return 'chrome-extension';
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

export const parseJson = (str: string, defaultValue: unknown = {}) => {
  try {
    return JSONBigint.parse(str);
  } catch {
    debug.error('Could not parse JSON. Using default instead.');
    return defaultValue;
  }
};
export const copyToClipboard = (str: string) => {
  const el = document.createElement('textarea'); // Create a <textarea> element
  el.value = str; // Set its value to the string that you want copied
  el.setAttribute('readonly', ''); // Make it readonly to be tamper-proof
  el.style.position = 'absolute';
  el.style.left = '-9999px'; // Move outside the screen to make it invisible
  document.body.appendChild(el); // Append the <textarea> element to the HTML document
  const documentSelection = document.getSelection();
  const selected =
    documentSelection && documentSelection.rangeCount > 0 // Check if there is any content selected previously
      ? documentSelection.getRangeAt(0) // Store selection if found
      : false; // Mark as false to know no selection existed before
  el.select(); // Select the <textarea> content
  document.execCommand('copy'); // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el); // Remove the <textarea> element
  if (selected && documentSelection) {
    // If a selection existed before copying
    documentSelection.removeAllRanges(); // Unselect everything on the HTML document
    documentSelection.addRange(selected); // Restore the original selection
  }
};

export const getFullUrl = (url: string, protocol = location.protocol) => {
  if (!url) {
    return url;
  }

  // regex to test if given string is an environment variable
  if (VARIABLE_REGEX.test(url)) {
    return url;
  }

  if (!isValidUrl(url)) {
    if (url.trim() === '*') {
      return location.href;
    }

    if (url.substr(0, 1) === '/') {
      url = url.substr(1);
    }
    return `${protocol.replace(/:$/, '').toLowerCase()}://${location.host}/${url}`;
  }

  return url;
};
export const isValidUrl = (urlString: string) => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};

export function parseDotNotationKey(key: string) {
  const intKey = parseInt(key, 10);
  return intKey.toString() === key ? intKey : key;
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
  value: TResult
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
  if (typeof currentPath === 'undefined') {
    return;
  }
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

export const mapToKeyValueList = (obj: Record<string, unknown>) => {
  return Object.entries(obj)
    .filter(([key, value]) => !!key && typeof value === 'string')
    .map(([key, value]) => ({ key, value: value as string }));
};

export function truncateText(text: string, maxLength = 70, symbol = '...') {
  let appendEllipsis = false;
  if (text.length > maxLength) {
    appendEllipsis = true;
  }

  return text.substring(0, maxLength) + (appendEllipsis ? symbol : '');
}

export const externalLink = (url: string, e?: Event) => {
  e?.preventDefault();

  const win = window.open(url, '_blank', 'noopener');
  if (win) {
    win.focus();
  }
};

export const str = (v: string | number | undefined | null): string | undefined => {
  switch (typeof v) {
    case 'string':
    case 'undefined':
      return v;
    case 'number':
      return `${v}`;
  }

  if (!v) {
    return;
  }

  return v;
};

export const isElectronApp = () => {
  const isElectron = !!window.navigator.userAgent.match(/Electron/);

  if (!isElectron) {
    return false;
  }

  if (!(window as any)[electronApiKey]) {
    debug.error(`Is in electron app but ${electronApiKey} is undefined!`);
    return false;
  }

  return true;
};

const toSnakeCase = (str = '') => {
  return str
    .replace(/[^a-z0-9]/gi, ' ')
    .toLowerCase()
    .replace(/\s/g, '_');
};

// Generate a random number between min and max
export const rand = (min = 0, max = Infinity) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const fromPromise = <T = unknown>(pp: Promise<T>) => {
  return from(pp).pipe(take(1));
};
