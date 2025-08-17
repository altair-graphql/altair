import packageJson from './package.json';
const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/);

const isDev = process.env.NODE_ENV === 'development';

export const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: isDev ? '[INTERNAL] Altair GraphQL Client' : 'Altair GraphQL Client',
  short_name: isDev ? '[INTERNAL] Altair' : 'Altair',
  description: 'A beautiful feature-rich GraphQL Client for all platforms.',
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}`, // .${label}`,
  // semver is OK in "version_name"
  version_name: version,
  icons: {
    16: 'icon.png',
    48: 'icon.png',
    128: 'icon.png',
  },
  action: {
    default_icon: 'icon.png',
  },
  permissions: ['storage', 'tabs', 'notifications'],
  host_permissions: ['https://*/*', 'http://*/*'],
  background: {
    scripts: ['assets/background.js'], // required for firefox support
    service_worker: 'assets/background.js',
    type: 'module',
  } as chrome.runtime.ManifestV3['background'],
  options_ui: {
    page: 'src/options.html',
    open_in_tab: false,
  },
  devtools_page: 'src/devtools/devtools.html',
  offline_enabled: true,
  content_security_policy: {
    // We can probably slim down this CSP further
    // sandbox:
    //   "sandbox allow-scripts allow-forms allow-popups allow-modals; script-src 'self' 'sha256-765ndVO8s0mJNdlCDVQJVuWyBpugFWusu1COU8BNbI8=' 'sha256-btk6arYQcHAX3O853bPKjrJz/yX/iuv4n0kXWYdJlEE=' 'sha256-kFTKSG2YSVB69S6DWzferO6LmwbqfHmYBTqvVbPEp4I=' 'unsafe-eval' https://cdn.jsdelivr.net https://apis.google.com https://www.gstatic.com/ https://*.firebaseio.com https://www.googleapis.com http://localhost:* https://localhost:* http://localhost:8002 http://localhost:8080; object-src 'self'; child-src 'self';",
  },
  // sandbox: {
  //   pages: ['altair-app/iframe-sandbox/index.html'],
  // },
  web_accessible_resources: [
    {
      resources: ['*.css', '*.woff', '*.woff2'],
      matches: ['<all_urls>'],
    },
  ],
};
