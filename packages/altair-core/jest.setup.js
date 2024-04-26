const crypto = require('crypto');
const { TextEncoder, TextDecoder } = require('util');

try {
  Object?.defineProperties(global.self, {
    crypto: {
      value: {
        subtle: crypto.webcrypto.subtle,
        getRandomValues(dataBuffer) {
          return crypto.randomFillSync(dataBuffer);
        },
        randomUUID() {
          return crypto.randomUUID();
        },
      },
    },
    TextDecoder: {
      value: TextDecoder,
    },
    TextEncoder: {
      value: TextEncoder,
    },
  });
} catch (e) {
  // catch silently for non-browser tests
}
