import getAltairHtml from './utils/get-altair-html';
import type { SubscriptionProviderIds } from 'altair-exported-types/dist/app/modules/altair/services/subscriptions/subscription-provider-registry.service';
import type { AltairConfigOptions } from 'altair-exported-types/dist/app/modules/altair/config';
import { SettingsState } from 'altair-exported-types/dist/app/modules/altair/store/settings/settings.interfaces';
import { IInitialEnvironments } from 'altair-exported-types/dist/app/modules/altair/store/environments/environments.interfaces';
import { IDictionary } from 'altair-exported-types/dist/app/modules/altair/interfaces/shared';

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
        .filter((key: any): key is keyof AltairConfigOptions => keys.includes(key))
        .map(key => getObjectPropertyForOption(renderOptions[key], key));

    return [ '{', ...optProps, '}'].join('\n');
};
function getObjectPropertyForOption(option: any, propertyName: keyof AltairConfigOptions) {
    if (option) {
        switch (typeof option) {
            case 'object':
              return `${propertyName}: ${JSON.stringify(option)},`;
        }
        return `${propertyName}: \`${option}\`,`;
    }
    return '';
}

export { getDistDirectory } from './utils/get-dist';

export default renderAltair;
