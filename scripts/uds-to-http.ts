/* eslint-disable no-console */
/**
 * A simple UDS HTTP proxy server.
 * UDS -> HTTP proxy.
 * For testing purposes. For a simple test, you can use curl:
 *
 * curl --unix-socket /tmp/http-proxy.sock http://example.com/
 * curl --unix-socket /tmp/http-proxy.sock -x http://localhost http://example.com
 */

import { createServer } from 'net';
import { request } from 'http';
import { existsSync, unlinkSync } from 'fs';
import { parse } from 'url';

const SOCKET_PATH = '/tmp/http-proxy.sock';

// Clean up old socket file if it exists
if (existsSync(SOCKET_PATH)) unlinkSync(SOCKET_PATH);

// Create a simple HTTP proxy server
const server = createServer((clientSocket) => {
  let buffer = '';

  clientSocket.on('data', (chunk) => {
    console.log('Received chunk:', chunk.toString());
    buffer += chunk.toString();

    // Wait until we have at least one full HTTP request line
    if (buffer.includes('\r\n\r\n')) {
      const [header = ''] = buffer.split('\r\n\r\n');
      const [requestLine = '', ...headerLines] = header.split('\r\n');
      const [method, path = '', version] = requestLine.split(' ');
      const hostHeader = headerLines.find((line) =>
        line.toLowerCase().startsWith('host:')
      );
      const host = hostHeader ? hostHeader.split(':')[1]?.trim() : null;

      if (!host) {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n\r\nMissing Host header');
        return;
      }

      const target = parse(path).host ? path : `http://${host}${path}`;
      console.log(`Proxying request: ${method} ${target}`);
      // Parse target URL (example: http://example.com/path)
      const parsed = parse(target);
      const options = {
        method,
        hostname: parsed.hostname,
        port: parsed.port || 80,
        path: parsed.path,
        headers: Object.fromEntries(
          headerLines.map((l) => {
            const i = l.indexOf(':');
            return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
          })
        ),
      };

      // Forward the request
      const proxyReq = request(options, (proxyRes) => {
        clientSocket.write(
          `${version} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`
        );
        Object.entries(proxyRes.headers).forEach(([k, v]) => {
          clientSocket.write(`${k}: ${v}\r\n`);
        });
        clientSocket.write('\r\n');
        proxyRes.pipe(clientSocket);
      });

      proxyReq.on('error', (err) => {
        clientSocket.end(`HTTP/1.1 502 Bad Gateway\r\n\r\n${err.message}`);
      });

      proxyReq.end();
      buffer = '';
    }
  });

  clientSocket.on('error', () => {});
});

server.listen(SOCKET_PATH, () => {
  // eslint-disable-next-line no-console
  console.log(`🟢 UDS HTTP proxy listening at ${SOCKET_PATH}`);
});
