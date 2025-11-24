app.on(
  'certificate-error',
  (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    // ⚠️ Security Risk: certificate validation is disabled here.
    // This is intended to allow self-signed certificates (e.g., for local dev),
    // but can expose users to MITM attacks on untrusted networks.
    callback(true);
    webContents.send('certificate-error', error);
  }
);
