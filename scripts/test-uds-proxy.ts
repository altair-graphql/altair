import http from 'http';

// Use to test the UDS HTTP proxy server
// curl --unix-socket /tmp/http-proxy.sock http://example.com/
http.get(
  {
    socketPath: '/tmp/http-proxy.sock',
    path: 'http://example.com/',
    headers: { Host: 'example.com' },
  },
  (res) => {
    res.pipe(process.stdout);
  }
);
