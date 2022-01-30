import getAltairHtml from './utils/get-altair-html';
import { AltairConfigOptions } from 'altair-graphql-core/build/config';

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
    serveInitialOptionsInSeperateRequest?: boolean;
}

/**
 * Render Altair Initial options as a string using the provided renderOptions
 * @param renderOptions
 */
export const renderInitialOptions = (options: RenderOptions = {}) => {
    return `
        AltairGraphQL.init(${
            getRenderedAltairOpts(options, [
                'endpointURL',
                'subscriptionsEndpoint',
                'initialQuery',
                'initialVariables',
                'initialPreRequestScript',
                'initialPostRequestScript',
                'initialHeaders',
                'initialEnvironments',
                'instanceStorageNamespace',
                'initialSettings',
                'initialSubscriptionsProvider',
                'initialSubscriptionsPayload',
                'preserveState',
                'initialHttpMethod',
                'initialWindows',
            ])
        });
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

const getRenderedAltairOpts = (renderOptions: RenderOptions, keys: (keyof AltairConfigOptions)[]) => {
    const optProps = Object.keys(renderOptions)
        .filter((key:keyof AltairConfigOptions): key is keyof AltairConfigOptions => keys.includes(key))
        .map(key => getObjectPropertyForOption(renderOptions[key], key));

    return [ '{', ...optProps, '}'].join('\n');
};
function getObjectPropertyForOption(option: any, propertyName: keyof AltairConfigOptions) {
    if (typeof option !== 'undefined') {
        switch (typeof option) {
            case 'object':
                return `${propertyName}: ${JSON.stringify(option)},`;
            case 'boolean':
                return `${propertyName}: ${option}`
        }
        return `${propertyName}: \`${option}\`,`;
    }
    return '';
}

export { getDistDirectory } from './utils/get-dist';

export default renderAltair;
