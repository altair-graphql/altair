export const secureRandomString = (length = 16) => {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((x) => charset[x % charset.length])
    .join('');
};

// https://thewoods.blog/base64url/
export const base64UrlEncode = (buffer: ArrayBuffer): string => {
  return btoa(
    Array.from(new Uint8Array(buffer), (b) => String.fromCharCode(b)).join('')
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const sha256 = async (str: string) => {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  return hashBuffer;
};

export const hex = (buffer: ArrayBuffer) => {
  const hexCodes = [];
  const view = new DataView(buffer);
  for (let i = 0; i < view.byteLength; i += 4) {
    const value = view.getUint32(i);
    const stringValue = value.toString(16);
    const padding = '00000000';
    const paddedValue = (padding + stringValue).slice(-padding.length);
    hexCodes.push(paddedValue);
  }
  return hexCodes.join('');
};

export const getCodeChallenge = async (codeVerifier: string) => {
  return base64UrlEncode(await sha256(codeVerifier));
};
