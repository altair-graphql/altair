import { SettingStore } from '@altairgraphql/electron-interop';
import { app, session } from 'electron';
import { log } from '../utils/log';
import { DEFAULT_BRIDGE_AUTH_HEADER, TcpUdsBridge } from './tcp-uds-bridge';

export const setupProxy = async (settings: SettingStore['settings']) => {
  let tuBridgeToken: string;
  await app.whenReady();

  if (settings) {
    const proxyConfig: Electron.ProxyConfig = {
      mode: 'direct',
    };

    switch (settings.proxy_setting) {
      case 'none':
        proxyConfig.mode = 'direct';
        break;
      case 'autodetect':
        proxyConfig.mode = 'auto_detect';
        break;
      case 'system':
        proxyConfig.mode = 'system';
        break;
      case 'pac':
        proxyConfig.mode = 'pac_script';
        proxyConfig.pacScript = settings.pac_address;
        break;
      case 'proxy_server':
        proxyConfig.mode = 'fixed_servers';
        proxyConfig.proxyRules = `${settings.proxy_host}:${settings.proxy_port}`;
        break;
      case 'uds_proxy': {
        if (!settings.socket_path) {
          throw new Error('Socket path is required for UDS proxy');
        }
        const tuBridge = new TcpUdsBridge(settings.socket_path);
        const { port, authToken } = await tuBridge.start();
        tuBridgeToken = authToken;
        proxyConfig.mode = 'fixed_servers';
        proxyConfig.proxyRules = `http://localhost:${port}`;
        // Bypass localhost traffic
        proxyConfig.proxyBypassRules = '<-loopback>';

        app.on('before-quit', () => {
          tuBridge.close();
        });
        break;
      }
      default:
    }
    await session.defaultSession.setProxy(proxyConfig);
    const proxy = await session.defaultSession.resolveProxy('http://localhost');
    log(proxy, proxyConfig);

    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      // Inject authentication header - that's it!
      // Everything else is forwarded transparently through the proxy
      if (settings.proxy_setting === 'uds_proxy' && tuBridgeToken) {
        details.requestHeaders[DEFAULT_BRIDGE_AUTH_HEADER] = tuBridgeToken;
      }

      callback({
        requestHeaders: details.requestHeaders,
      });
    });
  }
};
