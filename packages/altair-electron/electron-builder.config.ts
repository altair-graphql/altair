import type { Configuration } from 'electron-builder';

const isPublish = process.env.PUBLISH === 'true';
const isProduction = process.env.PRODUCTION === 'true';

const snapPublish: Configuration['publish'] = isPublish
  ? [
      ...(isProduction
        ? [{ provider: 'github' as const, releaseType: 'release' as const }]
        : []),
      {
        provider: 'snapStore',
        channels: [isProduction ? 'stable' : 'edge'],
      },
    ]
  : [];

const config: Configuration = {
  appId: 'com.xkoji.altair',
  productName: 'Altair GraphQL Client',
  directories: {
    buildResources: 'resources',
    output: 'out',
  },
  files: ['**/*', '!**/*.ts', '!**/*.ts.map', '!**/*.js.map', '!**/.env'],
  afterSign: 'scripts/notarize.js',
  mac: {
    artifactName: '${name}_${version}_${arch}_${os}.${ext}',
    category: 'public.app-category.developer-tools',
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] },
      { target: 'zip', arch: ['x64', 'arm64'] },
    ],
    icon: 'resources/mac_icon.icns',
    hardenedRuntime: true,
    darkModeSupport: true,
    entitlements: 'resources/entitlements.mac.plist',
    entitlementsInherit: 'resources/entitlements.mac.plist',
    strictVerify: false,
    // gatekeeperAssess: false,
  },
  dmg: {
    icon: 'resources/icon.png',
  },
  linux: {
    artifactName: '${name}_${version}_${arch}_linux.${ext}',
    icon: 'resources/icons',
    category: 'Development',
    maintainer: 'info@altairgraphql.dev',
    target: [
      { target: 'AppImage', arch: ['x64', 'arm64'] },
      'deb',
      'snap',
      // 'flatpak',
    ],
  },
  appImage: {
    category: 'Development',
  },
  snap: {
    base: 'core22',
    publish: snapPublish,
    layout: {
      '/usr/share/libdrm': { bind: '$SNAP/usr/share/libdrm' },
    },
  },
  win: {
    artifactName: '${name}_${version}_${arch}_win.${ext}',
  },
  // flatpak: {
  //   artifactName: '${name}_${version}_${arch}_flatpak.${ext}',
  //   runtime: 'org.freedesktop.Platform',
  //   runtimeVersion: '23.08',
  //   baseVersion: '23.08',
  // },
  electronCompile: false,
  protocols: {
    name: 'Altair GraphQL Client',
    schemes: ['altair'],
    role: 'Viewer',
  },
  artifactName: '${name}_${version}_${arch}_${os}.${ext}',
  publish:
    isPublish && isProduction
      ? { provider: 'github', releaseType: 'release' }
      : null,
  fileAssociations: [
    { ext: 'graphql', description: 'GraphQL File', role: 'Viewer' },
    { ext: 'gql', description: 'GraphQL File', role: 'Viewer' },
    { ext: 'agq', description: 'Altair GraphQL Query', role: 'Viewer' },
    { ext: 'agc', description: 'Altair GraphQL Collection', role: 'Viewer' },
    { ext: 'agbkp', description: 'Altair GraphQL Backup', role: 'Viewer' },
    { ext: 'agx', description: 'Altair GraphQL File', role: 'Viewer' },
  ],
};

export default config;
