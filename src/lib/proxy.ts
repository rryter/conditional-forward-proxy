import { createServer } from 'http';
import { createProxyServer } from 'http-proxy';
import 'net';
import pino from 'pino';
import 'url';
import { doNotCallProxy } from './https-local';
import { callProxy } from './https-proxy';

const logger = pino({
  name: 'CF-Proxy'
});

const conditionalProxyPort = 5050;
const proxy = createProxyServer({});
const server = createServer((req, res) => {
  proxy.web(req, res, {
    forward: 'http://127.0.0.1:3128',
    secure: false,
    toProxy: true
  });
});

server.on('connect', (req, clientSocket, head) => {
  const [host] = req.url.split(':', 2);
  !host.includes('mobicorp')
    ? doNotCallProxy(req, clientSocket, head, logger)
    : callProxy(req, clientSocket, logger);
});

logger.info(`CFProxy started and listening on port ${conditionalProxyPort}`);
server.listen(conditionalProxyPort);
