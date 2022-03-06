const crypto = require('crypto');

const createSha256CspHash = function(content) {
  return `sha256-${crypto.createHash('sha256').update(content).digest('base64')}`;
};

module.exports.createSha256CspHash = createSha256CspHash;
