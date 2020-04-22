import { IncomingMessage, request, ServerResponse } from 'http';
import * as Pino from 'pino';
import * as stream from 'stream';
import { ForwardProxy } from '../types/forward-proxy';

export const callProxy = (
  req: IncomingMessage,
  socket: stream.Duplex,
  logger: Pino.Logger,
  forwardProxy: ForwardProxy
) => {
  logger.info('Forwarding request to external proxy: 127.0.0.1:3128');
  logger.info(req);

  const connectOptions = {
    agent: false,
    headers: req.headers,
    host: forwardProxy.host.toString(),
    method: 'CONNECT',
    path: req.url,
    port: forwardProxy.port
  };

  const connectReq = request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false;
  connectReq.once('response', onResponse);
  connectReq.once('upgrade', onUpgrade);
  connectReq.once('connect', onConnect);
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res: any): void {
    res.upgrade = true;
  }

  function onUpgrade(res: ServerResponse, proxySocket: stream.Duplex): void {
    process.nextTick(() => {
      onConnect(res, proxySocket);
    });
  }

  function onConnect(res: ServerResponse, proxySocket: stream.Duplex): void {
    proxySocket.removeAllListeners();

    if (res.statusCode === 200) {
      socket.write('HTTP/1.1 200 OK\r\n\r\n');
      socket.pipe(proxySocket);
      proxySocket.pipe(socket);
    } else {
      logger.error(
        `Error when forwarding rquest.\r\n 
         StatusCode: ${res.statusCode}\r\n 
         Message: ${res.statusMessage}`
      );
      socket.write('HTTP/1.1 500 SERVER ERROR\r\n\r\n');
      socket.end();
      socket.destroy();
    }
  }

  function onError(error: Error): void {
    logger.error(
      `Error when forwarding rquest.\r\n 
           StatusCode: ${error.message}\r\n 
           Message: ${error.stack}`
    );
    socket.write('HTTP/1.1 500 SERVER ERROR\r\n\r\n');
    socket.end();
    socket.destroy();
  }
};
