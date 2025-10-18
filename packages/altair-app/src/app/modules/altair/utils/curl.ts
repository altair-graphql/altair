import { mapToKeyValueList } from '.';
import { IDictionary } from '../interfaces/shared';

export const parseCurlToObj = async (...args: any[]) =>
  (await import('curlup')).parseCurl(...args);

interface FileVariable {
  name: string;
  data: File;
}

interface GenerateCurlOpts {
  url: string;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  headers?: object;
  data?: { [key: string]: string };
  files?: FileVariable[];
}

const getCurlHeaderString = (header: { key: string; value: string }) => {
  return `-H '${header.key}: ${header.value}'`;
};

const buildUrl = (url: string, params?: { [key: string]: string }) => {
  const euc = encodeURIComponent;
  if (params) {
    const queryParams = Object.entries(params)
      .map(
        ([key, param]) =>
          euc(key) +
          '=' +
          euc(typeof param === 'string' ? param : JSON.stringify(param))
      )
      .join('&');

    return url.includes('?') ? `${url}&${queryParams}` : `${url}?${queryParams}`;
  }

  return url;
};

export const generateCurl = (opts: GenerateCurlOpts) => {
  const hasFiles = opts.files && opts.files.length > 0;
  
  const defaultHeaders = {
    'Accept-Encoding': 'gzip, deflate, br',
    'Content-Type': hasFiles ? 'multipart/form-data' : 'application/json',
    Accept: 'application/json',
    Connection: 'keep-alive',
    Origin: location.origin,
  };

  const method = opts.method || 'POST';

  const headers: IDictionary<string> = { ...defaultHeaders, ...opts.headers };
  
  // When using files, we should not set Content-Type header manually
  // curl will set it automatically with the boundary
  const headersToUse = hasFiles 
    ? Object.fromEntries(Object.entries(headers).filter(([key]) => key.toLowerCase() !== 'content-type'))
    : headers;
  
  const headerString = mapToKeyValueList(headersToUse).map(getCurlHeaderString).join(' ');

  const url = method === 'GET' ? buildUrl(opts.url, opts.data) : opts.url;

  const curlParts = [`'${url}'`];

  if (!['GET', 'POST'].includes(method)) {
    curlParts.push(`-X ${method}`);
  }

  curlParts.push(`${headerString}`);

  if (method !== 'GET') {
    if (hasFiles) {
      // Handle file uploads using multipart/form-data
      // Following the GraphQL multipart request spec:
      // https://github.com/jaydenseric/graphql-multipart-request-spec
      
      // Create file map for multipart request
      const fileMap: Record<string, string[]> = {};
      const dataWithNulls = JSON.parse(JSON.stringify(opts.data)); // Deep copy
      
      // Ensure variables object exists
      if (!dataWithNulls.variables) {
        dataWithNulls.variables = {};
      }
      
      opts.files.forEach((file, i) => {
        // Set file variables to null in the variables object
        const variablePath = file.name;
        setVariableToNull(dataWithNulls.variables, variablePath);
        fileMap[i] = [`variables.${variablePath}`];
      });
      
      // Add operations field (GraphQL query and variables with nulls for files)
      curlParts.push(`-F 'operations=${JSON.stringify(dataWithNulls)}'`);
      
      // Add map field (mapping of file indices to variable paths)
      curlParts.push(`-F 'map=${JSON.stringify(fileMap)}'`);
      
      // Add file fields
      opts.files.forEach((file, i) => {
        const fileName = file.data.name || `file${i}`;
        curlParts.push(`-F '${i}=@${fileName}'`);
      });
    } else {
      const dataBinary = `--data-binary '${JSON.stringify(opts.data)}'`;
      curlParts.push(dataBinary);
    }
  }

  return `curl ${curlParts.join(' ')} --compressed`;
};

// Helper function to set nested properties to null
const setVariableToNull = (obj: any, path: string) => {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = null;
};
