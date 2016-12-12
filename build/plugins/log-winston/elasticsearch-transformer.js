'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash.isplainobject');

var _lodash2 = _interopRequireDefault(_lodash);

var _jsonic = require('jsonic');

var _jsonic2 = _interopRequireDefault(_jsonic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const transformer = function transformer(_ref) {
  var _ref$timestamp = _ref.timestamp;
  let timestamp = _ref$timestamp === undefined ? new Date().toISOString() : _ref$timestamp,
      message = _ref.message,
      severity = _ref.level;
  var _ref$meta = _ref.meta;
  let meta = _ref$meta === undefined ? {} : _ref$meta;

  const pin = meta.pin,
        action = meta.action,
        plugin = meta.plugin,
        other = _objectWithoutProperties(meta, ['pin', 'action', 'plugin']);

  const fields = _extends({}, other);

  add(fields, 'pin', pin);
  add(fields, 'plugin', plugin);
  add(fields, 'action', action);

  return {
    '@timestamp': timestamp,
    message,
    severity,
    fields
  };
};

module.exports = transformer;

function add(fields, name, value) {
  if (value) {
    fields[name] = (0, _lodash2.default)(value) ? _jsonic2.default.stringify(value) : value;
  }
}
//# sourceMappingURL=elasticsearch-transformer.js.map