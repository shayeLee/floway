'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _extends = _interopDefault(require('babel-runtime/helpers/extends'));
var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));
var _regeneratorRuntime = _interopDefault(require('babel-runtime/regenerator'));
var _asyncToGenerator = _interopDefault(require('babel-runtime/helpers/asyncToGenerator'));
var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var mergeAll = require('rxjs/internal/operators/mergeAll');
var combineAll = require('rxjs/internal/operators/combineAll');

var _config = {};
var _setConfig = function _setConfig(customConfig) {
	_config = Object.assign({}, _config, customConfig);
};
var setConfig = _setConfig;

var rxStore = {};

/**
 * 获取持久化数据
 * @function persistence
 * @param {string} name
 * @param {*} defaultValue 
 * @param {promise} origin
 * @param {object} options
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

						if (data === defaultValue) {
							cacheData = null;
							storageData = null;
						} else {
							cacheData = data;
							storageData = JSON.stringify(data);
						}
						localStorage.setItem(name, storageData);
						if (_options.refresh || !isCache) {
							rxStore[name] = cacheData;
						}

						return _context.abrupt("return", rxStore[name]);

					case 26:
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
 */
var _attract = function _attract(type) {
	return _distributor$.pipe(operators.pluck(type), operators.filter(function (action) {
		return action;
	}));
};
var attract = _attract;

var _permeate = function permeate(suspendedObservers, stableObservers) {
	var handler = function handler(Comp) {
		var _stableObservers = void 0;
		if (Array.isArray(stableObservers)) {
			_stableObservers = stableObservers;
		} else {
			_stableObservers = stableObservers ? [stableObservers] : null;
		}

		var _suspendedObservers = void 0;
		if (Array.isArray(suspendedObservers)) {
			_suspendedObservers = suspendedObservers;
		} else {
			_suspendedObservers = [suspendedObservers];
		}

		var Permeate = function (_React$PureComponent) {
			_inherits(Permeate, _React$PureComponent);

			// 执行了几次setState
			function Permeate() {
				_classCallCheck(this, Permeate);

				/* let suspended$ = from(_suspendedObservers.concat([of({ passively: true })])).pipe(mergeAll());
    		let final$ = _stableObservers ? suspended$.pipe(combineLatest(from(_stableObservers).pipe(combineAll()))) : zip(suspended$);
    		this.subscription = final$
    	.subscribe(arr => {
    		let obj = {};
    				if (arr[1] && this.times === 0) arr[1].forEach(data => {
    			Object.keys(data).forEach(key => {
    				obj[key] = data[key];
    			});
    			++this.times;
    		});
    				Object.keys(arr[0]).forEach(key => {
    			if (
    				arr[0]["passively"] === true ||
    				this.state[key] === arr[0][key]
    			) return;	
    			obj[key] = arr[0][key];
    		});
    		
    		if (isCorrectVal(obj)) {
    			this.setState(obj);
    		}
    				_config.onStay && _config.onStay();
    	}); */
				var _this = _possibleConstructorReturn(this, (Permeate.__proto__ || Object.getPrototypeOf(Permeate)).call(this));

				_this.times = 0;
				_this.state = {};
				return _this;
			}

			_createClass(Permeate, [{
				key: "UNSAFE_componentWillMount",
				value: function UNSAFE_componentWillMount() {
					var _this2 = this;

					var suspended$ = rxjs.from(_suspendedObservers.concat([rxjs.of({ passively: true })])).pipe(mergeAll.mergeAll());

					var final$ = _stableObservers ? suspended$.pipe(operators.combineLatest(rxjs.from(_stableObservers).pipe(combineAll.combineAll()))) : rxjs.zip(suspended$);

					this.subscription = final$.subscribe(function (arr) {
						var obj = {};

						if (arr[1] && _this2.times === 0) arr[1].forEach(function (data) {
							if (!isCorrectVal(data)) return;
							Object.keys(data).forEach(function (key) {
								obj[key] = data[key];
							});
							++_this2.times;
						});

						if (arr[0]) Object.keys(arr[0]).forEach(function (key) {
							if (arr[0]["passively"] === true || _this2.state[key] === arr[0][key]) return;
							obj[key] = arr[0][key];
						});

						if (isCorrectVal(obj)) {
							_this2.setState(obj);
						}

						_config.onStay && _config.onStay();
					});
				}
			}, {
				key: "componentWillUnmount",
				value: function componentWillUnmount() {
					this.subscription.unsubscribe();
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
	if (typeof variable === 'string') {
		if (variable === '' || variable === 'undefined' || variable === 'null' || variable === 'NaN' || variable === 'Infinity') {
			result = false;
		}
	} else if (typeof variable === 'number') {
		if (isNaN(variable) || !isFinite(variable)) {
			result = false;
		}
		if (notBezero) return variable > 0;
	} else if (variable === null) {
		result = false;
	} else if (typeof variable === 'undefined') {
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
	return Object.prototype.toString.call(obj) === '[object Object]';
}

function _isEmptyObject(obj) {
	for (var key in obj) {
		return false;
	}
	return true;
}

exports.setConfig = setConfig;
exports.persistence = persistence;
exports.distributor$ = distributor$;
exports.attract = attract;
exports.permeate = permeate;
