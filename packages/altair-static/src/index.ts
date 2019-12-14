import { resolve } from 'path';
import getAltairHtml from './utils/get-altair-html';

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
     * Initial pre-request script to be added
     */
    initialPreRequestScript?: string;

    /**
     * Initial headers object to be added
     * @example
     * {
     *  'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
     * }
     */
    initialHeaders?: Object;

    /**
     * Whether to render the initial options in a seperate javascript file or not.
     * Use this to be able to enforce strict CSP rules.
     * @default false
     */
    serveInitialOptionsInSeperateRequest?: boolean;

    /**
     * Namespace for storing the data for the altair instance.
     * Use this when you have multiple altair instances running on the same domain.
     * @example
     * instanceStorageNamespace: 'altair_dev_'
     */
    instanceStorageNamespace?: string;
}

/**
 * Render Altair Initial options as a string using the provided renderOptions
 * @param renderOptions
 */
export const renderInitialOptions = ({
    endpointURL,
    subscriptionsEndpoint,
    initialQuery,
    initialVariables,
    initialHeaders,
    initialPreRequestScript,
    instanceStorageNamespace
}: RenderOptions = {}) => {
    return `
        const altairOpts = {
            ${getObjectPropertyForOption(endpointURL, 'endpointURL')}
            ${getObjectPropertyForOption(subscriptionsEndpoint, 'subscriptionsEndpoint')}
            ${getObjectPropertyForOption(initialQuery, 'initialQuery')}
            ${getObjectPropertyForOption(initialVariables, 'initialVariables')}
            ${getObjectPropertyForOption(initialPreRequestScript, 'initialPreRequestScript')}
            ${getObjectPropertyForOption(initialHeaders, 'initialHeaders')}
            ${getObjectPropertyForOption(instanceStorageNamespace, 'instanceStorageNamespace')}
        };
        AltairGraphQL.init(altairOpts);
    `;
}

/**
 * Render Altair as a string using the provided renderOptions
 * @param renderOptions
 */
export const renderAltair = (options: RenderOptions = {}) => {
    const altairHtml = getAltairHtml();
    const initialOptions = renderInitialOptions(options);
    const baseURL = options.baseURL || './';
    if (options.serveInitialOptionsInSeperateRequest) {
        return altairHtml
            .replace(/<base.*>/, `<base href="${baseURL}">`)
            .replace('</body>', `<script src="initial_options.js"></script></body>`);
    } else {
        return altairHtml
            .replace(/<base.*>/, `<base href="${baseURL}">`)
            .replace('</body>', `<script>${initialOptions}</script></body>`);
    }
};

function getObjectPropertyForOption(option: any, propertyName: string) {
    if (option) {
        let optionString = option;
        switch (typeof option) {
            case 'object':
                optionString = JSON.stringify(option);
        }
        return `${propertyName}: \`${optionString}\`,`;
    }
    return '';
}

/**
 * Returns the path to Altair assets, for resolving the assets when rendering Altair
 */
export const getDistDirectory = () => resolve(__dirname, 'dist');

export default renderAltair;
