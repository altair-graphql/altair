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
}

export const renderAltair = ({
    baseURL = './',
    endpointURL,
    subscriptionsEndpoint,
    initialQuery,
    initialVariables
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

    const renderedOptionsInScript = `<script>${renderedOptions}</script>`;
    return altairHtml.replace('<body>', `<body>${renderedOptionsInScript}`);
};

export const getDistDirectory = () => resolve(__dirname, 'dist');

export default renderAltair;
