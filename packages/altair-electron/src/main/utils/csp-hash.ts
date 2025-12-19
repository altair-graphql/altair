import crypto from 'crypto';

export const createSha256CspHash = function (content: string) {
  return `sha256-${crypto
    .createHash('sha256')
    .update(content)
    .digest('base64')}`;
};
