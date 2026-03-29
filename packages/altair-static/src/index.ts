import { altairConfigOptionsSchema } from 'altair-graphql-core/build/config/options.schema';
import getAltairHtml from './get-altair-html';
import type { AltairConfigOptions } from 'altair-graphql-core/build/config/options';

export interface RenderOptions extends AltairConfigOptions {
  /**
   * URL to be used as a base for relative URLs
   */
  baseURL?: string;

  /**
   * Whether to render the initial options in a seperate javascript file or not.
   * Use this to be able to enforce strict CSP rules.
   * @default false
   */
  serveInitialOptionsInSeperateRequest?: boolean | string;
}

function objectToJSLiteral(obj: unknown, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const innerSpaces = '  '.repeat(indent + 1);

  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj === 'boolean') return obj.toString();
  if (typeof obj === 'number') return obj.toString();

  // Handle strings - always use template literals
  if (typeof obj === 'string') {
    const escaped = obj
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');
    return '`' + escaped + '`';
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    const items = obj.map(
      (item) => innerSpaces + objectToJSLiteral(item, indent + 1)
    );
    return '[\n' + items.join(',\n') + '\n' + spaces + ']';
  }

  // Handle objects
  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';

    const pairs = entries.map(([key, value]) => {
      const valueStr = objectToJSLiteral(value, indent + 1);
      // Check if key is a valid JS identifier
      const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
      const keyStr = isValidIdentifier
        ? key
        : `'${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
      return `${innerSpaces}${keyStr}: ${valueStr}`;
    });

    return '{\n' + pairs.join(',\n') + '\n' + spaces + '}';
  }

  return String(obj);
}

/**
 * Render Altair Initial options as a string using the provided renderOptions
 * @param renderOptions
 * @deprecated Use renderInitSnippet instead
 */
export const renderInitialOptions = (options: RenderOptions = {}) => {
  return renderInitSnippet(options);
};

/**
 * Render Altair init JS snippet as a string using the provided renderOptions
 * @param renderOptions
 */
export const renderInitSnippet = (options: RenderOptions = {}) => {
  const indent = 4;
  return `\n${' '.repeat(indent)}AltairGraphQL.init(${getRenderedAltairOpts(options, indent)}\n${' '.repeat(indent)});\n`;
};

/**
 * Render Altair as a string using the provided renderOptions
 * @param renderOptions
 */
export const renderAltair = (options: RenderOptions = {}) => {
  const altairHtml = getAltairHtml();
  const initialOptions = renderInitSnippet(options);
  const baseURL = options.baseURL || './';
  if (options.serveInitialOptionsInSeperateRequest) {
    if (!options.cspNonce) {
      // When using cspNonce, the initial options must be inlined to avoid CSP issues
      // because loading a the script in a separate request will likely cause a new CSP nonce to be generated
      // which will not match the original nonce used in the main HTML file
      // and thus the script will be blocked by the browser.
      const scriptName =
        typeof options.serveInitialOptionsInSeperateRequest === 'string'
          ? options.serveInitialOptionsInSeperateRequest
          : 'initial_options.js';
      return altairHtml
        .replace(/<base.*>/, `<base href="${baseURL}">`)
        .replace('<style>', `<style nonce="${options.cspNonce ?? ''}">`)
        .replace(
          '</body>',
          () =>
            `<script type="module" nonce="${options.cspNonce ?? ''}" src="${scriptName.replace(/["'<>=]/g, '')}"></script></body>`
        );
    }
  }

  return altairHtml
    .replace(/<base.*>/, `<base href="${baseURL}">`)
    .replace('<style>', `<style nonce="${options.cspNonce ?? ''}">`)
    .replace(
      '</body>',
      () =>
        `<script type="module" nonce="${options.cspNonce ?? ''}">${initialOptions}</script></body>`
    );
};

const getRenderedAltairOpts = (renderOptions: RenderOptions, indent = 0) => {
  const opts = altairConfigOptionsSchema.parse(renderOptions);
  return objectToJSLiteral(opts, indent);
};

export const isSandboxFrame = (path: string) => {
  return path.split('/').includes('iframe-sandbox');
};

export { getDistDirectory } from './get-dist';
export { getAltairHtml };

export default renderAltair;
