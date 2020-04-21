import { IncomingMessage, request, ServerResponse } from 'http';
import * as stream from 'stream';

export const callProxy = (req: IncomingMessage, socket: stream.Duplex) => {
  //   console.log('Send request to squid proxy.');

  const connectOptions = {
    agent: false,
    headers: req.headers,
    host: '127.0.0.1',
    method: 'CONNECT',
    path: req.url,
    port: 3128
  };

  // from TunnelingAgent.prototype.createSocket
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
      socket.write('HTTP/1.1 500 SERVER ERROR\r\n\r\n');
      socket.end();
      socket.destroy();
    }
  }

  function onError(): void {
    socket.write('HTTP/1.1 500 SERVER ERROR\r\n\r\n');
    socket.end();
    socket.destroy();
  }
};
