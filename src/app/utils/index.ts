import * as toSnakeCase from 'to-snake-case';
import * as downloadJs from 'downloadjs';
import * as parseCurl from 'parse-curl';
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
  downloadJs(dataStr, `${toSnakeCase(fileName)}.${_opts.fileType}`, _opts.mimeType);
  // const downloadLink = document.createElement('a');
  // const linkText = document.createTextNode('Download');
  // downloadLink.appendChild(linkText);
  // downloadLink.style.display = 'none';
  // downloadLink.setAttribute('target', '_blank');
  // downloadLink.setAttribute('href', dataStr);
  // downloadLink.setAttribute('download', `${toSnakeCase(fileName)}.${_opts.fileType}`);
  // document.body.appendChild(downloadLink);
  // downloadLink.click();
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

  const dataStr = encodeURIComponent(JSON.stringify(obj));
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
    console.log('There was an issue while opening the file: ', err);
  });
}

export const parseCurlToObj = (...args) => parseCurl(...args);
