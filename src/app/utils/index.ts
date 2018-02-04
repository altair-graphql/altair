import * as toSnakeCase from 'to-snake-case';
const fileDialog = require('file-dialog');

/**
 * Download an object as a JSON file
 * @param obj The object to be downloaded
 * @param fileName The name the file will be called
 */
export const downloadJson = (obj, fileName = 'response', opts = undefined) => {
  let _opts = {
    fileType: 'json'
  };

  if (opts) {
    _opts = { ..._opts, ...opts };
  }

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
  const downloadLink = document.createElement('a');
  const linkText = document.createTextNode('Download');
  downloadLink.appendChild(linkText);
  downloadLink.style.display = 'none';
  downloadLink.setAttribute('href', dataStr);
  downloadLink.setAttribute('download', `${toSnakeCase(fileName)}.${_opts.fileType}`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
};

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
