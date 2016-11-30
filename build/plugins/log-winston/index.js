'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _genid = require('./../../utils/genid');

var _genid2 = _interopRequireDefault(_genid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

exports.default = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  let label = _ref.label,
      settings = _objectWithoutProperties(_ref, ['label']);

  return (micro, _ref2) => {
    let onClose = _ref2.onClose;

    const plugin = { id: (0, _genid2.default)() };

    let logger = new _winston2.default.Logger(_extends({
      level: micro.log.level,
      levels: micro.log.LEVELS
    }, settings));

    logger.add(_winston2.default.transports.Console, {
      label
    });

    micro.emit('plugin.logger.use');
    micro.on('log', (_ref3) => {
      let level = _ref3.level,
          message = _ref3.message,
          payload = _ref3.payload;
      return logger[level](message, payload);
    });

    onClose(() => {
      micro.emit('plugin.logger.unuse');
      logger = null;
    });

    return plugin;
  };
};
//# sourceMappingURL=index.js.map