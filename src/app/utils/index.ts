import * as toSnakeCase from 'to-snake-case';

export const downloadJson = (obj, fileName = 'response') => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
  const downloadLink = document.createElement('a');
  const linkText = document.createTextNode('Download');
  downloadLink.appendChild(linkText);
  downloadLink.style.display = 'none';
  downloadLink.setAttribute('href', dataStr);
  downloadLink.setAttribute('download', `${toSnakeCase(fileName)}.json`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
};
