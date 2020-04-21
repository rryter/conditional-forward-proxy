import { createServer } from 'http';
import { createProxyServer } from 'http-proxy';
import 'net';
import pino from 'pino';
import 'url';
import { ForwardProxy } from '../types/forward-proxy';
import { doNotCallProxy } from './https-local';
import { callProxy } from './https-proxy';

const logger = pino({
  name: 'CF-Proxy',
  prettyPrint: true
});
export function createConditionalForwardProxy(
  port: number,
  proxyToForwardTo: ForwardProxy
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

  logger.info(`CFProxy started and listening on port ${conditionalProxyPort}`);
  server.listen(conditionalProxyPort);
}
