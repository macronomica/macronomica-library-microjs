'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = serverOnClose;

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _wrapped = require('error/wrapped');

var _wrapped2 = _interopRequireDefault(_wrapped);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ERROR_TYPE = 'micro.plugin.http-node';

const ServerCloseInternalError = (0, _wrapped2.default)({
  message: ['{name} - Внутренняя ошибка остановки сервера', '{name} - {origMessage}'].join(_os2.default.EOL),
  type: `${ ERROR_TYPE }.server.close.internal`
});

function serverOnClose(server, app, settings, meta) {
  var _meta$plugin = meta.plugin;
  const host = _meta$plugin.host,
        port = _meta$plugin.port;


  return () => new _promise2.default((resolve, reject) => {
    server.close(err => {
      if (err) {
        let error = ServerCloseInternalError(err);
        app.log.error(error.message, meta);
        return reject(error);
      }

      app.log.info(`Остановлен Node Http сервер (host=${ host },port=${ port })`, meta);
      resolve();
    });
  });
}
//# sourceMappingURL=server-on-close.js.map