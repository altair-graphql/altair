require('dotenv').config();
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log('Notarizing application');
  await notarize({
    tool: 'notarytool',
    appBundleId: 'com.xkoji.altair',
    appPath: `${appOutDir}/${appName}.app`,
    // appleId: process.env.APPLEID,
    // appleIdPassword: process.env.APPLEIDPASS,
    appleApiKeyId: process.env.API_KEY_ID,
    appleApiIssuer: process.env.API_KEY_ISSUER_ID,
    teamId: process.env.APPLETEAMID,
  }).then(res => console.log('Notarization completed!') || res);
};
