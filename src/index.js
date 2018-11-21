import { Subject, BehaviorSubject, from } from "rxjs";
import { map, pluck, filter, last, switchMap } from "rxjs/operators";
import { pipeFromArray } from "rxjs/internal/util/pipe";
import { combineAll } from "rxjs/internal/operators/combineAll";
import { fromPromise } from "rxjs/internal/observable/fromPromise";

/**
 * @namespace config
 * @prop {observable} [preObservable=defaultIfEmpty(null)]
*/
let _config = {};
const _setConfig = function(customConfig) {
  _config = Object.assign({}, _config, customConfig);
};
export const setConfig = _setConfig;

const rxStore = {};
export const __rxStore__ = rxStore;

/**
 * 获取持久化数据
 * @function persistence
 * @param {string} name
 * @param {*} defaultValue
 * @param {promise} origin
 * @param {object} [options]
 * @param {boolean} [options.refresh=false] - 是否刷新数据
 */
const _persistence = async function(name, defaultValue, origin, options) {
  const _options = Object.assign(
    {
      refresh: false,
    },
    options
  );

  const _getNewData = function() {
    return origin().then(data => {
      if (!isCorrectVal(data)) {
        data = defaultValue;
      }
      return data;
    });
  };
  let data, storageData, cacheData;
  const strData = localStorage.getItem(name);
  const isCache = isCorrectVal(rxStore[name]);

  if (_options.refresh) {
    data = await _getNewData();
  } else if (isCache) {
    data = rxStore[name];
  } else if (isCorrectVal(strData)) {
    data = JSON.parse(strData);
  } else {
    data = await _getNewData();
  }
  
  cacheData = data;
  storageData = JSON.stringify(data);

  localStorage.setItem(name, storageData);
  if (_options.refresh || !isCache) {
    rxStore[name] = cacheData;
  }

  return rxStore[name];
};
export const persistence = _persistence;

const _distributor$ = new Subject().pipe(
  map(actions => {
    if (!Array.isArray(actions)) {
      actions = [actions];
    }

    const map = {};
    actions.forEach(action => {
      if (typeof action === "string") {
        action = { type: action };
      }
      map[action.type] = action;
    });
    return map;
  })
);
export const distributor$ = {
  subscription: {
    unsubscribe: function () {}
  },
  next: function (events) {
    this.subscription.unsubscribe();
    const obs$ = _config.preObservable.pipe(last());
    this.subscription = obs$.subscribe(() => {
      _distributor$.next(events);
    });
  }
};

export const promiseOf = function (p) {
  return _config.preObservable.pipe(last(), switchMap(() => {
    return fromPromise(p);
  }));
}

/**
 * @param {string} type - action类型
 * @param {*} defaultValue - 可观察对象推送的默认数据
 */
const Attract = function(type, defaultValue) {
  const event$ = _distributor$.pipe(
    pluck(type),
    filter(action => action)
  )
  const processEvent$ = generateObs(event$);

  processEvent$.pipe = function () {
    var operations = [];
    for (var i = 0; i < arguments.length; i++) {
      operations.push(arguments[i]);
    }

    const obs$ = pipeFromArray(operations)(event$);
    
    return generateObs(obs$);
  }

  function generateObs(obs$) {
    const obs$$ = new BehaviorSubject(defaultValue).pipe(
      filter((data) => {
        return isCorrectVal(data);
      })
    );
    obs$.subscribe(obs$$);

    return obs$$;
  }

  return processEvent$;
};
export const attract = function (type, defaultValue) {
  // return new Attract(type, defaultValue);
  return Attract(type, defaultValue);
}

const _permeate = function (observablesMap, param1, param2) {
  try {
    React.PureComponent
  } catch(err) {
    // throw new ReferenceError("请提供有效的全局对象React，本库不单独引入react.js");
    var React = require("react");
  }

  const initObservers = param1;
  let options = param2 || {};
  if (isCorrectVal(param1) && !isCorrectVal(param2) && !isCorrectVal(initObservers.subscribe)) {
    options = param1;
  }

  const handler = function(Comp) {
    let _initObservers;
    if (Array.isArray(initObservers)) {
      _initObservers = initObservers;
    } else {
      _initObservers = initObservers ? [initObservers] : null;
    }

    if (!_isObject(observablesMap))
      throw new TypeError(
        `方法permeate()的参数observablesMap必须是object类型`
      );
    const suspendedObserverKeys = Object.keys(observablesMap);
    const _suspendedObservers = [];
    if (suspendedObserverKeys.length > 0) {
      suspendedObserverKeys.forEach(key => {
        _suspendedObservers.push(observablesMap[key]);
      });
    } else {
      throw new TypeError(
        `方法permeate()的参数observablesMap不允许传一个空的object`
      );
    }

    class Permeate extends React.PureComponent {
      subscriptionArr = [];
      state = {};

      componentDidMount() {
        const obsArr = _suspendedObservers,
          len = obsArr.length;
        for (let i = 0; i < len; i++) {
          const subscription = obsArr[i].subscribe(data => {
            if (options.delayeringFields && options.delayeringFields.includes(suspendedObserverKeys[i])) {
              const _stateObj = {};
              for (const key in data) {
                if (this.state[key] !== data[key])
                  _stateObj[key] = data[key];
              }
              this.setState(_stateObj);
              return;
            }

            if (this.state[suspendedObserverKeys[i]] !== data) {
              this.setState({
                [suspendedObserverKeys[i]]: data,
              });
            }
          });
          this.subscriptionArr.push(subscription);
        }

        if (_initObservers === null) return;
        const init$ = from(_initObservers).pipe(combineAll());
        const initSubscription = init$.subscribe(dataArr => {
          const stateObj = {};
          dataArr.forEach(data => {
            if (!_isObject(data)) throw new TypeError("init observable 推送的数据必须是object类型");
            Object.keys(data).forEach(key => {
              if (this.state[key] !== data[key])
                stateObj[key] = data[key];
            });
          });
          if (isCorrectVal(stateObj)) {
            this.setState(stateObj);
          }
        });
        this.subscriptionArr.push(initSubscription);
      }
      componentWillUnmount() {
        this.subscriptionArr.forEach(subscription => {
          subscription.unsubscribe();
        });
      }
      render() {
        return <Comp {...this.state} {...this.props} />;
      }
    }
    Permeate.displayName = `Permeate(${Comp.displayName ||
      Comp.name ||
      "Component"})`;
    return Permeate;
  };
  return handler;
};
export const permeate = _permeate;

function isCorrectVal(variable, notBezero) {
  var result = true;
  if (typeof variable === "string") {
    if (
      variable === "" ||
      variable === "undefined" ||
      variable === "null" ||
      variable === "NaN" ||
      variable === "Infinity"
    ) {
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
