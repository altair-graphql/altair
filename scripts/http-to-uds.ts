/* eslint-disable no-console */
import net from 'net';

const TCP_PORT = 8080;
const TCP_HOST = '127.0.0.1';
const UDS_PATH = '/tmp/http-proxy.sock';

const server = net.createServer((tcpSocket) => {
  const udsSocket = net.connect(UDS_PATH);
  tcpSocket.pipe(udsSocket);
  udsSocket.pipe(tcpSocket);
});

server.listen(TCP_PORT, TCP_HOST, () => {
  console.log(`Bridge running tcp://${TCP_HOST}:${TCP_PORT} → ${UDS_PATH}`);
});
