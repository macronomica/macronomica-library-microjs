import http from 'http';
import jwt from 'jsonwebtoken';
import buffer from 'buffer';
import qs from 'qs';
import bodyParser from 'body-parser';
import url from 'url';
import makeRequest from './../../../utils/make-request';
import iterate from './../../../utils/iterate';
import {
  SERVER_SECRET,
  SERVER_TRANSPORT_HEADER,
  SERVER_REQUEST_HEADER,
  
  SERVER_PREFIX,
  SERVER_HOST,
  SERVER_PORT,
  RESPONSE_PROPERTY_STATUS,
  RESPONSE_PROPERTY_RESULT,
  RESPONSE_STATUS_SUCCESS,
  RESPONSE_STATUS_ERROR
} from './../constants';

const jsonBodyParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const type = 'http';

const preprocessors = [
  jsonBodyParser,
  urlencodedParser
];

export default function listenHttp(app, plugin, onClose, settings = {}) {
  return function listenHttpRoute() {
    const server = http.createServer(handleRequest);
    const { host = SERVER_HOST, port = SERVER_PORT } = settings;

    app.log.debug('Настройки HTTP сервера', { plugin: { host, port } });
    server.on('error', app.log.error);
    server.on('connection', (socket) => {
      socket.setNoDelay(); // Отключаем алгоритм Нагла.
    });

    onClose(() => new Promise((resolve, reject) => {
      server.close((err) => {
        if (err && err.message !== 'Not running') {
          return reject(err);
        }
        app.log.info('Остановлен Node Http сервер', { plugin: { host, port } });
        resolve();
      });
    }), 'unshift');

    return new Promise((resolve, reject) => {
      server.listen(port, host, (err) => {
        if (err) {
          return reject(err);
        }
        app.log.info('Запущен Node Http сервер', { plugin: { host, port } });
        resolve();
      });
    });

    function handleRequest(req, res, next){
      const errorMessage = `${ RESPONSE_STATUS_ERROR }.transport.http.listen`;
      const error404Message = `404:${ errorMessage }`;

      req._originalUrl = req.url;
      req.url = url.parse(req.url);
      req.query = qs.parse(req.url.query);

      if (req.url.pathname !== SERVER_PREFIX) {
        app.log.error(`[${ error404Message }/url.not.found]`, {
          error: url
        });
        return response404(res, `${ error404Message }/url.not.found`);
      }

      iterate(req.method === 'POST' ? preprocessors : [], req, res, (err) => {
        if (err) {
          app.log.error(`[${ error404Message }/preprocessors.parse]`, { error: err });
          return response404(res, `${ error404Message }/preprocessors.parse`);
        }
        const transport = {
          type,
          origin: req.headers[ 'user-agent' ],
          method: req.method,
          time  : Date.now()
        };

        if (SERVER_TRANSPORT_HEADER in req.headers) {
          Object
            .assign(transport, jwt.verify(req.headers[ SERVER_TRANSPORT_HEADER ], SERVER_SECRET).transport);
        }

        transport.trace = [
          ...(transport.trace || []),
          app.name
        ];

        const pin = {
          ...(req.body || {}),
          ...req.query
        };
        const request = makeRequest(app, {
          transport,
          request: (SERVER_REQUEST_HEADER in req.headers)
            ? jwt.verify(req.headers[ SERVER_REQUEST_HEADER ], SERVER_SECRET).request
            : null,
          ...pin
        });

        if (pin.role === 'plugin') {
          app.log.warn(`Вызов приватного метода`, { pin, request });
          app.log.info(`[${ error404Message }/call.private.method]`, {
            error: error404Message,
            pin, request
          });
          return response404(res, {});
        }

        app.act(request, (error, result) => {
          const code = error ? 500 : 200;
          const level = error ? 'error' : 'info';
          const status = error ? RESPONSE_STATUS_ERROR : RESPONSE_STATUS_SUCCESS;
          const meta = {
            request: request.request,
            pin
          };

          if (!!error && error.code === 'error.common/act.not.found') {
            request.duration();
            app.log.error(`[${ error404Message }/act.not.found]`, { ...meta, error });
            return response404(res, error);
          }

          const outJson = JSON.stringify({
            [ RESPONSE_PROPERTY_STATUS ]: status,
            [ RESPONSE_PROPERTY_RESULT ]: error || result
          });

          res.writeHead(code, {
            'Content-Type'  : 'application/json',
            // 'Cache-Control' : 'private, max-age=0, no-cache, no-store',
            'Content-Length': buffer.Buffer.byteLength(outJson)
          });

          const message = `[${ code }:${ req.method }:${ status }] ${ request.duration() }ms`;

          if (code === 500) {
            meta.error = error;
          }

          app.log[ level ](message, meta);

          res.end(outJson);
        });
      });
    }
  };
}

function response404(res, result) {
  const json = JSON.stringify({
    [ RESPONSE_PROPERTY_STATUS ]: RESPONSE_STATUS_ERROR,
    [ RESPONSE_PROPERTY_RESULT ]: result
  });

  res.writeHead(404, {
    'Content-Type'  : 'application/json',
    'Cache-Control' : 'private, max-age=0, no-cache, no-store',
    'Content-Length': buffer.Buffer.byteLength(json)
  });

  res.statusMessage = 'Not found';
  res.end(json);
}