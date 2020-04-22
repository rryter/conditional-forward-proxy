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
  logger.info(
    `Handling '${req.method} ${req.url}' via ${forwardProxy.host.address}:${forwardProxy.port} proxy`
  );

  const connectOptions = {
    agent: false,
    headers: req.headers,
    host: forwardProxy.host.address,
    method: 'CONNECT',
    path: req.url,
    port: forwardProxy.port
  };

  const connectReq = request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false;
  // connectReq.once('response', onResponse);
  // connectReq.once('upgrade', onUpgrade);
  connectReq.once('connect', onConnect);
  connectReq.once('error', onError);
  connectReq.end();

  //   function onResponse(res: any): void {
  //     res.upgrade = true;
  //   }

  //   function onUpgrade(res: ServerResponse, proxySocket: stream.Duplex): void {
  //     process.nextTick(() => {
  //       onConnect(res, proxySocket);
  //     });
  //   }

  function onConnect(res: ServerResponse, proxySocket: stream.Duplex): void {
    proxySocket.removeAllListeners();

    if (res.statusCode === 200) {
      logger.info(
        `HTTP/${req.httpVersion} ${res.statusCode} '${req.method} ${req.url}'`
      );
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
