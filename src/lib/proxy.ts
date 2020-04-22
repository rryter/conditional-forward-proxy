import { createServer } from 'http';
import { createProxyServer } from 'http-proxy';
import 'net';
import P from 'pino';
import 'url';
import { ForwardProxy } from '../types/forward-proxy';
import { doNotCallProxy } from './https-local';
import { callProxy } from './https-proxy';

export function createConditionalForwardProxy(
  port: number,
  proxyToForwardTo: ForwardProxy,
  logger: P.Logger
): void {
  const conditionalProxyPort = port;
  const proxy = createProxyServer({});
  const server = createServer((req, res) => {
    proxy.web(req, res, {
      forward: {
        host: proxyToForwardTo.host.toString(),
        port: proxyToForwardTo.port.toString()
      },
      secure: false,
      toProxy: true
    });
  });

  server.on('connect', (req, clientSocket, head) => {
    const [requestHost] = req.url.split(':', 2);
    !requestHost.includes('mobicorp')
      ? doNotCallProxy(req, clientSocket, head, logger)
      : callProxy(req, clientSocket, logger, proxyToForwardTo);
  });

  logger.info(`CFProxy is now running on port ${conditionalProxyPort}`);
  logger.info(
    `Remote Proxy: http://${proxyToForwardTo.host.address}:${proxyToForwardTo.port}`
  );
  server.listen(conditionalProxyPort);
}
