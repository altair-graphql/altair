/* eslint-disable no-console */
/**
 * A simple UDS server that responds to HTTP requests.
 * For demonstration purposes.
 *
 * To test, you can use curl:
 *
 * curl --unix-socket /tmp/test-destination.sock http://localhost
 */
import net from 'net';
import fs from 'fs';

const SOCKET_PATH = '/tmp/test-destination.sock';

// Remove the socket file if it exists
if (fs.existsSync(SOCKET_PATH)) fs.unlinkSync(SOCKET_PATH);

const server = net.createServer((socket) => {
  console.log('Client connected');

  socket.on('data', (data) => {
    console.log('Received:', data.toString());

    // Simple HTTP response
    const response = `HTTP/1.1 200 OK\r
Content-Type: text/plain\r
Content-Length: 20\r
\r
Hello from UDS server!\n`;
    socket.write(response);
  });

  socket.on('end', () => console.log('Client disconnected'));
});

server.listen(SOCKET_PATH, () => {
  console.log(`UDS destination server listening at ${SOCKET_PATH}`);
});
