require('dotenv').config();
const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log(
    'Notarizing application',
    process.env.APPLE_ID,
    process.env.APPLE_TEAM_ID
  );
  await notarize({
    tool: 'notarytool',
    // appBundleId: 'com.xkoji.altair',
    appPath: path.resolve(appOutDir, `${appName}.app`),
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  }).then((res) => console.log('Notarization completed!') || res);
};
