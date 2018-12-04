import { Subject, BehaviorSubject, from } from "rxjs";
import { map, pluck, filter, last, switchMap } from "rxjs/operators";
import { pipeFromArray } from "rxjs/internal/util/pipe";
import { combineAll } from "rxjs/internal/operators/combineAll";
// import update from 'immutability-helper';

/**
 * @namespace config
 * @prop {observable} [preObservable=defaultIfEmpty(null)]
*/
let _config = {};
const _setConfig = function(customConfig) {
  _config = Object.assign({}, _config, customConfig);
};
export const setConfig = _setConfig;

const rxStore = {
  dataMap: {},
  pushHeadersMap: {}
};
export const __rxStore__ = rxStore;

/**
 * 创建一个包含指定数据、并且可更新数据的observable
 * @function hotObservable
 * @param {*} data
*/
function _hotObservable(data) {
  const state$ = new BehaviorSubject(data);
  state$.__data__ = data;
  state$.update = function (mData) {
    let newData;
    const _data = (typeof mData === "function") ? mData(state$.__data__) : mData;
    if (_isObject(_data)) {
      newData = Object.assign({}, state$.__data__, _data)
    } else {
      newData = _data;
    }
    state$.__data__ = newData;
    state$.next(newData);
  };
  return state$;
}
export const hotObservable = _hotObservable;

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


const _distributor$ = new Subject();
export const distributor$ = {
  next: function (events) {
    if (!Array.isArray(events)) {
      events = [events];
    }
    const map = {};
    events.forEach(event => {
      if (typeof event === "string") {
        const type = event;
        event = { type: type };
      }
      map[event.type] = event;
      rxStore.pushHeadersMap[event.type] = {
        lastModifyId: (new Date()).getTime()
      };
    });
    _distributor$.next(map);
  }
};

/**
 * @param {string} type - action类型
 */
const Attract = function(type, options) {
  if (!isCorrectVal(options)) options = {};
  const event$ = _distributor$.pipe(
    pluck(type),
    filter(action => {
      return isCorrectVal(action);
    })
  )

  function generateObs(obs$) {
    const obs$$ = new Subject().pipe(
      filter((data) => {
        return isCorrectVal(data);
      })
    );
    obs$$.__type__ = type;
    obs$.subscribe(obs$$);
    return obs$$;
  }
  const processEvent$ = generateObs(event$);

  processEvent$.pipe = function () {
    var operations = [];
    for (var i = 0; i < arguments.length; i++) {
      operations.push(arguments[i]);
    }

    const obs$ = pipeFromArray(operations)(event$);
    
    return generateObs(obs$);
  }
  return processEvent$;
};
export const attract = function (type, defaultValue) {
  return Attract(type, defaultValue);
}

const _permeate = function (observablesMap, param1, param2) {
  try {
    React.PureComponent
  } catch(err) {
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
    const suspendedObservableKeys = Object.keys(observablesMap);
    const _suspendedObservables = [];
    if (suspendedObservableKeys.length > 0) {
      suspendedObservableKeys.forEach(key => {
        _suspendedObservables.push(observablesMap[key]);
      });
    } else {
      throw new TypeError(
        `方法permeate()的参数observablesMap不允许传一个空的object`
      );
    }

    class Permeate extends React.PureComponent {
      subscriptionArr = [];
      state = isCorrectVal(options.defaultProps) ? options.defaultProps : {};

      componentWillMount() {
        const obsArr = _suspendedObservables,
          len = obsArr.length;
        for (let i = 0; i < len; i++) {
          if (!isCorrectVal(obsArr[i]["flag"])) obsArr[i]["flag"] = (new Date()).getTime();
          const subscription = obsArr[i].subscribe(data => {
            const type = obsArr[i]["__type__"];
            // const pushHeaders = rxStore.pushHeadersMap[type];

            if (options.delayeringFields && options.delayeringFields.includes(suspendedObservableKeys[i])) {
              const _stateObj = {};
              for (const key in data) {
                if (this.state[key] !== data[key]){
                  _stateObj[key] = data[key];
                }
              }
              this.setState(_stateObj);
              return;
            }

            if (this.state[suspendedObservableKeys[i]] !== data) {
              this.setState({
                [suspendedObservableKeys[i]]: data,
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
