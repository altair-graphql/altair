import { resolve } from 'path';

/**
 * Returns the path to Altair assets, for resolving the assets when rendering Altair
 */
export const getDistDirectory = () => resolve(__dirname, '../dist');
