import { IncomingMessage } from 'http';
import { connect } from 'net';
import * as stream from 'stream';

export function doNotCallProxy(
  req: IncomingMessage,
  clientSocket: stream.Duplex,
  head: Uint8Array | string
): void {
  const [host, port] = req?.url?.split(':', 2) as any;
  const srvSocket = connect(
    {
      host,
      port
    },
    () => {
      clientSocket.write(
        'HTTP/1.1 200 Connection Established\r\n' +
          'Proxy-agent: Node-Proxy\r\n' +
          '\r\n'
      );
      srvSocket.write(head);
      srvSocket.pipe(clientSocket);
      clientSocket.pipe(srvSocket);
    }
  );
}
