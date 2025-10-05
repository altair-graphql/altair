import net from 'net';
import { timingSafeEqual, randomBytes } from 'crypto';
import getPort from 'get-port';
import { error, log } from '../utils/log';

const TCP_HOST = '127.0.0.1';
export const DEFAULT_BRIDGE_AUTH_HEADER = 'x-bridge-auth';

export class TcpUdsBridge {
  private server: net.Server;
  private connections: Map<
    string,
    { tcpSocket: net.Socket; udsSocket: net.Socket }
  > = new Map();
  private authToken = randomBytes(32).toString('hex');

  constructor(
    private readonly udsPath: string,
    private readonly authHeader = DEFAULT_BRIDGE_AUTH_HEADER
  ) {
    this.server = net.createServer((tcpSocket) => {
      const connectionId = `${tcpSocket.remoteAddress}:${tcpSocket.remotePort}`;
      let requestBuffer = Buffer.alloc(0);
      let udsSocket: net.Socket | undefined = undefined;

      // Listen for initial data to check authentication
      const onInitialData = (chunk: Buffer) => {
        requestBuffer = Buffer.concat([requestBuffer, chunk]);
        const requestStr = requestBuffer.toString('utf8');

        const result = this.processAndAuthenticateRequest(requestStr);
        if (!result) {
          // Haven't received complete headers yet, wait for more data
          return;
        }

        if (!result.authenticated) {
          error(`[TCP] Authentication failed for ${connectionId}`);
          this.sendUnauthorized(tcpSocket);
          return;
        }

        log(`[TCP] Authentication successful for ${connectionId}`);

        // Remove the data listener now that we've authenticated
        tcpSocket.off('data', onInitialData);

        // Create UDS connection
        udsSocket = net.connect(this.udsPath);

        // Store connection pair
        this.connections.set(connectionId, { tcpSocket, udsSocket });

        // Forward the sanitized request (with auth header stripped) to UDS
        udsSocket.write(Buffer.from(result.sanitizedRequest, 'utf8'));

        // Pipe remaining data between TCP and UDS sockets (bidirectional)
        tcpSocket.pipe(udsSocket);
        udsSocket.pipe(tcpSocket);

        // Handle UDS socket errors
        udsSocket.on('error', (err) => {
          error(`[UDS] Error: ${err.message}`);
          tcpSocket.destroy();
        });

        // Handle UDS socket close
        udsSocket.on('close', () => {
          log(`[UDS] Connection closed`);
          tcpSocket.end();
        });

        // Handle UDS socket end
        udsSocket.on('end', () => {
          log(`[UDS] Connection ended`);
          tcpSocket.end();
        });
      };

      tcpSocket.on('data', onInitialData);

      // Handle TCP socket errors
      tcpSocket.on('error', (err) => {
        error(`[TCP] Error: ${err.message}`);
        if (udsSocket) {
          udsSocket.destroy();
        }
      });

      // Handle TCP socket close
      tcpSocket.on('close', () => {
        log(`[TCP] Connection closed`);
        if (udsSocket) {
          udsSocket.end();
        }
        this.connections.delete(connectionId);
      });

      // Handle TCP socket end
      tcpSocket.on('end', () => {
        log(`[TCP] Connection ended`);
        if (udsSocket) {
          udsSocket.end();
        }
      });
    });

    process.on('SIGINT', () => {
      log('Shutting down bridge...');
      this.server.close(() => process.exit(0));
    });
  }

  async start() {
    const port = await getPort();

    if (this.server.listening) {
      this.server.close();
    }
    // // Handle server errors - reject
    // this.server.once('error', (err) => {
    //   if (err.code === 'EADDRINUSE') {
    //     error(`Port ${port} is already in use`);
    //   } else {
    //     error(`Server error: ${err.message}`);
    //   }
    //   process.exit(1);
    // });

    this.server.listen(port, TCP_HOST, () => {
      log(`Bridge running tcp://${TCP_HOST}:${port} → ${this.udsPath}`);
    });

    return { port, authToken: this.authToken };
  }

  close() {
    if (this.server.listening) {
      this.server.close();
    }
    // Close all active connections
    this.connections.forEach(({ tcpSocket, udsSocket }) => {
      tcpSocket.destroy();
      udsSocket.destroy();
    });
    this.connections.clear();
  }

  /**
   * Parse HTTP request, verify authentication, and return sanitized request.
   * This method does three things in a single pass:
   * 1. Checks if complete headers have been received
   * 2. Verifies the X-Bridge-Auth header
   * 3. Strips the auth header from the request
   */
  private processAndAuthenticateRequest(
    data: string
  ):
    | { authenticated: true; sanitizedRequest: string }
    | { authenticated: false; sanitizedRequest?: never }
    | undefined {
    // Check if we have received the complete HTTP headers (ends with \r\n\r\n)
    const headersEndIndex = data.indexOf('\r\n\r\n');
    if (headersEndIndex === -1) {
      // Haven't received complete headers yet, wait for more data
      return undefined;
    }

    const headersStr = data.substring(0, headersEndIndex);
    const body = data.substring(headersEndIndex);
    const lines = headersStr.split('\r\n');

    let authValue: string | undefined;
    const sanitizedLines: string[] = [];

    // Single pass through all lines: extract auth header and build sanitized request
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();

        if (key === this.authHeader.toLowerCase()) {
          authValue = value;
          // Skip this line in sanitized output
          continue;
        }
      }
      sanitizedLines.push(line);
    }

    // Verify authentication using timing-safe comparison
    const authenticated =
      authValue &&
      authValue.length === this.authToken.length &&
      timingSafeEqual(Buffer.from(authValue), Buffer.from(this.authToken));

    if (!authenticated) {
      return { authenticated: false };
    }

    const sanitizedRequest = sanitizedLines.join('\r\n') + body;
    return { authenticated: true, sanitizedRequest };
  }

  private sendUnauthorized(socket: net.Socket) {
    const response = [
      'HTTP/1.1 401 Unauthorized',
      'Content-Type: text/plain',
      'Connection: close',
      '',
      'Unauthorized: Invalid or missing X-Bridge-Auth header',
    ];
    socket.write(response.join('\r\n'));
    socket.end();
  }
}
