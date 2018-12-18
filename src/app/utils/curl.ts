const curlup = require('curlup');
export const parseCurlToObj = (...args) => curlup.parseCurl(...args);

interface GenerateCurlOpts {
  url: string;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  headers?: object;
  data?: object;
}

const getCurlHeaderString = (header: { key: string, value: string }) => {
  return `-H '${header.key}: ${header.value}'`;
}

const buildUrl = (url: string, params: object) => {
  const euc = encodeURIComponent;
  if (params) {
    const queryParams = Object.keys(params)
      .map(key => euc(key) + '=' + euc(typeof params[key] === 'string' ? params[key] : JSON.stringify(params[key])))
      .join('&');

    return url.includes('?') ? `${url}&${queryParams}` : `${url}?${queryParams}`;
  }

  return url;
};

export const generateCurl = (opts: GenerateCurlOpts) => {
  const defaultHeaders = {
    'Accept-Encoding': 'gzip, deflate, br',
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Connection: 'keep-alive',
    Origin: location.origin
  };

  const method = opts.method || 'POST';

  const headers = { ...defaultHeaders, ...opts.headers };
  const headerString = Object.keys(headers)
    .filter(key => !!key)
    .map(key => ({ key, value: headers[key] }))
    .map(getCurlHeaderString)
    .join(' ');

  const url = method === 'GET' ? buildUrl(opts.url, opts.data) : opts.url;

  const curlParts = [ `'${url}'` ];

  if (!['GET', 'POST'].includes(method)) {
    curlParts.push(`-X ${method}`);
  }

  curlParts.push(`${headerString}`);

  if (method !== 'GET') {
    const dataBinary = `--data-binary '${JSON.stringify(opts.data)}'`;
    curlParts.push(dataBinary);
  }

  return `curl ${curlParts.join(' ')} --compressed`;
};
