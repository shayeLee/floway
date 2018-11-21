'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _extends = _interopDefault(require('babel-runtime/helpers/extends'));
var _defineProperty = _interopDefault(require('babel-runtime/helpers/defineProperty'));
var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));
var _regeneratorRuntime = _interopDefault(require('babel-runtime/regenerator'));
var _asyncToGenerator = _interopDefault(require('babel-runtime/helpers/asyncToGenerator'));
var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var pipe = require('rxjs/internal/util/pipe');
var combineAll = require('rxjs/internal/operators/combineAll');

/* let _config = {};
const _setConfig = function(customConfig) {
  _config = Object.assign({}, _config, customConfig);
};
export const setConfig = _setConfig; */

var rxStore = {};
var __rxStore__ = rxStore;

/**
 * 获取持久化数据
 * @function persistence
 * @param {string} name
 * @param {*} defaultValue
 * @param {promise} origin
 * @param {object} [options]
 * @param {boolean} [options.refresh=false] - 是否刷新数据
 */
var _persistence = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(name, defaultValue, origin, options) {
    var _options, _getNewData, data, storageData, cacheData, strData, isCache;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _options = Object.assign({
              refresh: false
            }, options);

            _getNewData = function _getNewData() {
              return origin().then(function (data) {
                if (!isCorrectVal(data)) {
                  data = defaultValue;
                }
                return data;
              });
            };

            data = void 0, storageData = void 0, cacheData = void 0;
            strData = localStorage.getItem(name);
            isCache = isCorrectVal(rxStore[name]);

            if (!_options.refresh) {
              _context.next = 11;
              break;
            }

            _context.next = 8;
            return _getNewData();

          case 8:
            data = _context.sent;
            _context.next = 22;
            break;

          case 11:
            if (!isCache) {
              _context.next = 15;
              break;
            }

            data = rxStore[name];
            _context.next = 22;
            break;

          case 15:
            if (!isCorrectVal(strData)) {
              _context.next = 19;
              break;
            }

            data = JSON.parse(strData);
            _context.next = 22;
            break;

          case 19:
            _context.next = 21;
            return _getNewData();

          case 21:
            data = _context.sent;

          case 22:

            cacheData = data;
            storageData = JSON.stringify(data);

            localStorage.setItem(name, storageData);
            if (_options.refresh || !isCache) {
              rxStore[name] = cacheData;
            }

            return _context.abrupt("return", rxStore[name]);

          case 27:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function _persistence(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();
var persistence = _persistence;

var _distributor$ = new rxjs.Subject().pipe(operators.map(function (actions) {
  if (!Array.isArray(actions)) {
    actions = [actions];
  }

  var map = {};
  actions.forEach(function (action) {
    if (typeof action === "string") {
      action = { type: action };
    }
    map[action.type] = action;
  });
  return map;
}));
var distributor$ = _distributor$;

/**
 * @param {string} type - action类型
 * @param {*} defaultValue - 可观察对象推送的默认数据
 */
var Attract = function Attract(type, defaultValue) {
  var event$ = _distributor$.pipe(operators.pluck(type), operators.filter(function (action) {
    return action;
  }));
  var processEvent$ = generateObs(event$);

  processEvent$.pipe = function () {
    var operations = [];
    for (var i = 0; i < arguments.length; i++) {
      operations.push(arguments[i]);
    }

    var obs$ = pipe.pipeFromArray(operations)(event$);

    return generateObs(obs$);
  };

  function generateObs(obs$) {
    var obs$$ = new rxjs.BehaviorSubject(defaultValue).pipe(operators.filter(function (data) {
      return isCorrectVal(data);
    }));
    obs$.subscribe(obs$$);

    return obs$$;
  }

  return processEvent$;
};
var attract = function attract(type, defaultValue) {
  // return new Attract(type, defaultValue);
  return Attract(type, defaultValue);
};

var _permeate = function _permeate(observablesMap, param1, param2) {
  try {
    React.PureComponent;
  } catch (err) {
    // throw new ReferenceError("请提供有效的全局对象React，本库不单独引入react.js");
    var React = require("react");
  }

  var initObservers = param1;
  var options = param2 || {};
  if (isCorrectVal(param1) && !isCorrectVal(param2) && !isCorrectVal(initObservers.subscribe)) {
    options = param1;
  }

  var handler = function handler(Comp) {
    var _initObservers = void 0;
    if (Array.isArray(initObservers)) {
      _initObservers = initObservers;
    } else {
      _initObservers = initObservers ? [initObservers] : null;
    }

    if (!_isObject(observablesMap)) throw new TypeError("\u65B9\u6CD5permeate()\u7684\u53C2\u6570observablesMap\u5FC5\u987B\u662Fobject\u7C7B\u578B");
    var suspendedObserverKeys = Object.keys(observablesMap);
    var _suspendedObservers = [];
    if (suspendedObserverKeys.length > 0) {
      suspendedObserverKeys.forEach(function (key) {
        _suspendedObservers.push(observablesMap[key]);
      });
    } else {
      throw new TypeError("\u65B9\u6CD5permeate()\u7684\u53C2\u6570observablesMap\u4E0D\u5141\u8BB8\u4F20\u4E00\u4E2A\u7A7A\u7684object");
    }

    var Permeate = function (_React$PureComponent) {
      _inherits(Permeate, _React$PureComponent);

      function Permeate() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, Permeate);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Permeate.__proto__ || Object.getPrototypeOf(Permeate)).call.apply(_ref2, [this].concat(args))), _this), _this.subscriptionArr = [], _this.state = {}, _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(Permeate, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          var _this2 = this;

          var obsArr = _suspendedObservers,
              len = obsArr.length;

          var _loop = function _loop(i) {
            var subscription = obsArr[i].subscribe(function (data) {
              if (options.delayeringFields && options.delayeringFields.includes(suspendedObserverKeys[i])) {
                var _stateObj = {};
                for (var key in data) {
                  if (_this2.state[key] !== data[key]) _stateObj[key] = data[key];
                }
                _this2.setState(_stateObj);
                return;
              }

              if (_this2.state[suspendedObserverKeys[i]] !== data) {
                _this2.setState(_defineProperty({}, suspendedObserverKeys[i], data));
              }
            });
            _this2.subscriptionArr.push(subscription);
          };

          for (var i = 0; i < len; i++) {
            _loop(i);
          }

          if (_initObservers === null) return;
          var init$ = rxjs.from(_initObservers).pipe(combineAll.combineAll());
          var initSubscription = init$.subscribe(function (dataArr) {
            var stateObj = {};
            dataArr.forEach(function (data) {
              if (!_isObject(data)) throw new TypeError("init observable 推送的数据必须是object类型");
              Object.keys(data).forEach(function (key) {
                if (_this2.state[key] !== data[key]) stateObj[key] = data[key];
              });
            });
            if (isCorrectVal(stateObj)) {
              _this2.setState(stateObj);
            }
          });
          this.subscriptionArr.push(initSubscription);
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.subscriptionArr.forEach(function (subscription) {
            subscription.unsubscribe();
          });
        }
      }, {
        key: "render",
        value: function render() {
          return React.createElement(Comp, _extends({}, this.state, this.props));
        }
      }]);

      return Permeate;
    }(React.PureComponent);

    Permeate.displayName = "Permeate(" + (Comp.displayName || Comp.name || "Component") + ")";
    return Permeate;
  };
  return handler;
};
var permeate = _permeate;

function isCorrectVal(variable, notBezero) {
  var result = true;
  if (typeof variable === "string") {
    if (variable === "" || variable === "undefined" || variable === "null" || variable === "NaN" || variable === "Infinity") {
      result = false;
    }
  } else if (typeof variable === "number") {
    if (isNaN(variable) || !isFinite(variable)) {
      result = false;
    }
    if (notBezero) return variable > 0;
  } else if (variable === null) {
    result = false;
  } else if (typeof variable === "undefined") {
    result = false;
  } else if (_isObject(variable)) {
    if (_isEmptyObject(variable)) {
      result = false;
    }
  } else if (Array.isArray(variable)) {
    if (variable.length === 0) {
      result = false;
    }
  }
  return result;
}

function _isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

function _isEmptyObject(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
}

exports.__rxStore__ = __rxStore__;
exports.persistence = persistence;
exports.distributor$ = distributor$;
exports.attract = attract;
exports.permeate = permeate;
