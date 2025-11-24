app.on(
  'certificate-error',
  (event, webContents, url, error, certificate, callback) => {
    const { hostname } = new URL(url);
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    event.preventDefault();
    // ⚠️ Security Risk: certificate validation is disabled for localhost.
    // This is intended to allow self-signed certificates (e.g., for local dev).
    callback(isLocal);
    webContents.send('certificate-error', error);
  }
);