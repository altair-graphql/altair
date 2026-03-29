// TODO: For some reason, importing from altair-db in login-redirect package causes issues. Strangely this only seems to affect login-redirect package.
// Getting src/login-redirect.ts (4:2): "IDENTITY_PROVIDERS" is not exported by "../altair-db/build/client.js", imported by "src/login-redirect.ts".
// Will investigate later.
const IDENTITY_PROVIDERS = {
  GOOGLE: 'GOOGLE',
  GITHUB: 'GITHUB',
} as const;
type IdentityProvider = (typeof IDENTITY_PROVIDERS)[keyof typeof IDENTITY_PROVIDERS];

export { IDENTITY_PROVIDERS, IdentityProvider };

export function getPopupUrl(
  url: string,
  nonce: string,
  source: string,
  provider: IdentityProvider
) {
  const urlObj = new URL(url);
  urlObj.searchParams.append('nonce', nonce);
  urlObj.searchParams.append('sc', source);
  urlObj.searchParams.append('provider', provider);

  return urlObj.href;
}
