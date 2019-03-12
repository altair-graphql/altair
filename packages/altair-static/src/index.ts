import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface RenderOptions {
    /**
     * URL to be used as a base for relative URLs
     */
    baseURL?: string;

    /**
     * URL to set as the server endpoint
     */
    endpointURL?: string;

    /**
     * URL to set as the subscription endpoint
     */
    subscriptionsEndpoint?: string;

    /**
     * Initial query to be added
     */
    initialQuery?: string;

    /**
     * Initial variables to be added
     */
    initialVariables?: string;

    /**
     * Initial headers object to be added
     * @example
     * {
     *  'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
     * }
     */
    initialHeaders?: Object;
}

export const renderAltair = ({
    baseURL = './',
    endpointURL,
    subscriptionsEndpoint,
    initialQuery,
    initialVariables,
    initialHeaders,
}: RenderOptions = {}) => {
    let altairHtml = readFileSync(resolve(__dirname, 'dist/index.html'), 'utf8');

    let renderedOptions = '';

    altairHtml = altairHtml.replace(/<base.*>/, `<base href="${baseURL}">`);
    if (endpointURL) {
        renderedOptions += `window.__ALTAIR_ENDPOINT_URL__ = '${endpointURL}';`;
    }
    if (subscriptionsEndpoint) {
        renderedOptions += `window.__ALTAIR_SUBSCRIPTIONS_ENDPOINT__ = '${subscriptionsEndpoint}';`;
    }
    if (initialQuery) {
        renderedOptions += `window.__ALTAIR_INITIAL_QUERY__ = '${initialQuery}';`;
    }

    if (initialVariables) {
        renderedOptions += `window.__ALTAIR_INITIAL_VARIABLES__ = '${initialVariables}';`;
    }

    if (initialHeaders) {
        renderedOptions += `window.__ALTAIR_INITIAL_HEADERS__ = ${JSON.stringify(initialHeaders)};`;
    }

    const renderedOptionsInScript = `<script>${renderedOptions}</script>`;
    return altairHtml.replace('<body>', `<body>${renderedOptionsInScript}`);
};

export const getDistDirectory = () => resolve(__dirname, 'dist');

export default renderAltair;
