'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

exports.default = (_ref) => {
  let property = _ref.property;
  var _ref$types = _ref.types;

  let types = _ref$types === undefined ? [] : _ref$types,
      info = _objectWithoutProperties(_ref, ['property', 'types']);

  if (!Array.isArray(types)) {
    types = ['empty-types'];
  }

  return (0, _error2.default)(_extends({
    message: `property.${ property }.${ _error.ERROR_PROPERTY_MUST_BE }.${ types.join('.or.') }`
  }, info));
};
//# sourceMappingURL=property-must-be-types-error.js.map