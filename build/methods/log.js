'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LEVELS = undefined;

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _constants = require('./../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @name LEVELS
 * @type {Object<string, number>}
 * @enum {number}
 */
const LEVELS = exports.LEVELS = {
  [_constants.LEVEL_OFF]: 0,

  [_constants.LEVEL_FATAL]: 10,
  [_constants.LEVEL_ERROR]: 20,
  [_constants.LEVEL_WARN]: 30,
  [_constants.LEVEL_INFO]: 40,
  [_constants.LEVEL_TRACE]: 50,
  [_constants.LEVEL_DEBUG]: 60,

  [_constants.LEVEL_ALL]: 100
};

/**
 * @param {app} app
 * @param { string } [level]
 * @returns {object}
 */

exports.default = function (app) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$level = _ref.level;

  let level = _ref$level === undefined ? _constants.LEVEL_DEFAULT : _ref$level;

  /**
   * Levels:
   *
   * ALL    Все уровни
   * OFF    Отключить ведение журнала
   *
   * INFO   Информационные сообщения
   * TRACE  Информационные сообщения, с дополнительной информацией
   * DEBUG  Информационные события, которые наиболее полезны для отладки приложения.
   *
   * WARN   Предупреждения о потенциально опасных ситуациях
   * ERROR  Ошибка, но которая позволяет приложению продолжать работать
   * FATAL  Ошибка, которая приводит завершению приложения
   */

  /**
   * @namespace app.log
   */
  const logger = {
    /**
     * @memberof app.log
     * @type {string}
     */
    level,
    /**
     * @memberof app.log
     * @type {Object<!string, !number>}
     */
    LEVELS,
    /**
     * @memberof app.log
     * @name debug
     * @param {string|Array<string>} message
     * @param {*} [payload]
     */
    [_constants.LEVEL_DEBUG]: log(_constants.LEVEL_DEBUG),
    /**
     * @memberof app.log
     * @name trace
     * @param {string|Array<string>} message
     * @param {*} [payload]
     */
    [_constants.LEVEL_TRACE]: log(_constants.LEVEL_TRACE),
    /**
     * @memberof app.log
     * @name info
     * @param {string|Array<string>} message
     * @param {*} [payload]
     */
    [_constants.LEVEL_INFO]: log(_constants.LEVEL_INFO),
    /**
     * @memberof app.log
     * @name warn
     * @param {string|Array<string>} message
     * @param {*} [payload]
     */
    [_constants.LEVEL_WARN]: log(_constants.LEVEL_WARN),
    /**
     * @memberof app.log
     * @name error
     * @param {string|Array<string>} message
     * @param {*} [payload]
     */
    [_constants.LEVEL_ERROR]: log(_constants.LEVEL_ERROR),
    /**
     * @memberof app.log
     * @name fatal
     * @param {string|Array<string>} message
     * @param {*} [payload]
     */
    [_constants.LEVEL_FATAL]: log(_constants.LEVEL_FATAL)
  };
  let usePluginLogger;

  app.on('plugin.logger.use', () => usePluginLogger = true);
  app.on('plugin.logger.unuse', () => usePluginLogger = false);

  process.on('uncaughtException', logger.fatal);

  return logger;

  /**
   * @param {string} level
   * @returns {function(string, payload)}
   */
  function log(level) {
    return (message, payload) => {
      if (LEVELS[logger.level] < LEVELS[level]) {
        return logger;
      }

      if (level === _constants.LEVEL_FATAL) {
        const error = message instanceof Error ? message : new Error(message);
        let stack = error.stack || '';
        stack = stack.replace(/^.*?\n/, '\n').replace(/\n/g, '\n          ');

        message = ['##############################################################################################', `# Fatal Error`, '# Instance  : ' + app.id, '# Started At: ' + app.time.started, '# =========================================================================================== ', '  Message   : ' + error.message, '  Code      : ' + error.code, '  Payload   : ' + _util2.default.inspect(payload, { depth: null }), '  Details   : ' + _util2.default.inspect(error.details, { depth: null }), '  When      : ' + new Date().toISOString(), '  Stack     : ' + stack, '  Node      : ' + _util2.default.inspect(process.versions).replace(/\s+/g, ' '), '              ' + _util2.default.inspect(process.features).replace(/\s+/g, ' '), '              ' + _util2.default.inspect(process.moduleLoadList).replace(/\s+/g, ' '), '  Process   : ', '              pid=' + process.pid, '              arch=' + process.arch, '              platform=' + process.platform, '              path=' + process.execPath, '              argv=' + _util2.default.inspect(process.argv).replace(/\n/g, ''), '              env=' + _util2.default.inspect(process.env).replace(/\n/g, ''), '##############################################################################################'];
      }

      if (level === _constants.LEVEL_ERROR && message instanceof Error) {
        const error = message;
        let stack = error.stack || '';
        stack = stack.replace(/^.*?\n/, '\n').replace(/\n/g, '\n          ');

        message = ['##############################################################################################', `# Error`, '# =========================================================================================== ', '  Instance  : ' + app.id, '  Message   : ' + error.message, '  Code      : ' + error.code, '  Payload   : ' + _util2.default.inspect(payload, { depth: null }), '  Details   : ' + _util2.default.inspect(error.details, { depth: null }), '  When      : ' + new Date().toISOString(), '  Stack     : ' + stack, '  Node      : ' + _util2.default.inspect(process.versions).replace(/\s+/g, ' '), '              ' + _util2.default.inspect(process.features).replace(/\s+/g, ' '), '              ' + _util2.default.inspect(process.moduleLoadList).replace(/\s+/g, ' '), '  Process   : ', '              pid=' + process.pid, '              arch=' + process.arch, '              platform=' + process.platform, '              path=' + process.execPath, '              argv=' + _util2.default.inspect(process.argv).replace(/\n/g, ''), '              env=' + _util2.default.inspect(process.env).replace(/\n/g, ''), '##############################################################################################'];
      }

      if (Array.isArray(message)) {
        message.forEach(emitOne);
      } else {
        emitOne(message);
      }

      return logger;

      function emitOne(message) {
        if (usePluginLogger) {
          app.emit('log', { level, message, payload });
          app.emit(`log.${ level }`, { level, message, payload });
        } else {
          const args = [`${ level }: [${ app.id }]`, message];

          if (!!payload) {
            args.push(JSON.stringify(payload, '', 4));
          }

          switch (level) {
            case _constants.LEVEL_ERROR:
            case _constants.LEVEL_FATAL:
              console.error(...args);
              break;
            case _constants.LEVEL_WARN:
              console.warn(...args);
              break;
            default:
              console.log(...args);
          }
        }
      }
    };
  }
};
//# sourceMappingURL=log.js.map