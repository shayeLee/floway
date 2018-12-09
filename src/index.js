import { Subject, BehaviorSubject, from, of } from "rxjs";
import { map, pluck, filter, combineLatest, switchMap } from "rxjs/operators";
import { pipeFromArray } from "rxjs/internal/util/pipe";
// import update from 'immutability-helper';
import md5 from "js-md5";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Redis from "../browser-redis/src/index.js";
const redis = new Redis();

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
  subscriptionList: [],
  dataMap: {},
  pushHeadersMap: {}
};
export const __rxStore__ = rxStore;

/**
 * 创建一个包含指定数据、并且可更新数据的observable
 * @function hotObservable
 * @param {*} data
*/
function _ofHot(data) {
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
export const ofHot = _ofHot;

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
      if (!isCorrectVal(event.payload)) event.payload = {}; 
      if (!isCorrectVal(event.options)) event.options = {};
      map[event.type] = event;
    });
    _distributor$.next(map);
  }
};

export const ofLast = function (obs$) {
  return obs$.pipe(combineLatest(), map(arr => arr[0]))
}

/**
 * @param {string} type - action类型
 */
const Attract = function(type) {
  let options = null;
  const _options = {
    useCache: false,
    cacheType: "eventCache"  // eventCache pagingCache itemCache
  }

  if (isCorrectVal(type) && (typeof type === "string")) {
    options = Object.assign({}, _options);
  } else if (isCorrectVal(type) && _isObject(type)) {
    options = Object.assign({}, _options, type);
    type = options.type;
    delete options.type
  }

  if (!isCorrectVal(options)) options = {
    useCache: false
  };
  const event$ = _distributor$.pipe(
    pluck(type),
    filter(event => {
      if (isCorrectVal(event)) {
        if (
          isCorrectVal(event.options.paginationFields) &&
          isCorrectVal(event.options.paginationFields.pageNum) &&
          isCorrectVal(event.options.paginationFields.pageSize) 
        ) {
          options.useCache = true;
          options.cacheType = "pagingCache";
        }

        if (!isCorrectVal(rxStore.pushHeadersMap[event.type])) {
          rxStore.pushHeadersMap[event.type] = {
            event,
            lastModifyId: (new Date()).getTime()
          };
        } else {
          const pushHeaders = rxStore.pushHeadersMap[event.type];
          const lastEvent = pushHeaders.event;
          // 判断是否要更新lastModifyId
          if (
            !options.useCache ||
            (
              (md5(JSON.stringify(lastEvent.payload)) !== md5(JSON.stringify(event.payload))) ||
              (md5(JSON.stringify(lastEvent.options)) !== md5(JSON.stringify(event.options)))
            )
          ) {
            rxStore.pushHeadersMap[event.type]["lastModifyId"] = (new Date()).getTime();
          }
          pushHeaders.event = event;
        }
        return true;
      }
      return false;
    })
  )

  const operations = [];
  let _subscription = {
    unsubscribe: function () {}
  }
  function generateObs(obs$) {
    _subscription.unsubscribe();
    const obs$$ = new Subject();
    obs$$.__type__ = type;
    const _obs$ = obs$.pipe(
      switchMap(event => {
        const pushHeaders = rxStore.pushHeadersMap[event.type];
        let hasModified = obs$$.lastModifyId !== pushHeaders.lastModifyId;
        let cacheData;
        if (options.useCache && !hasModified) {
          // pagingCache itemCache
          switch (options.cacheType) {
            case "eventCache":
              cacheData = rxStore.dataMap[event.type];
              if (!isCorrectVal(cacheData)) {
                hasModified = true;
                pushHeaders.lastModifyId = (new Date()).getTime();
              }
              break;
            case "pagingCache":
              // TODO: 判断分页数据是否有缓存数据
              break;
          }
        }
        event.hasModified = hasModified;
        if (!hasModified) NProgress.start();
        return hasModified ? ((operations.length === 0) ? of(event) : pipeFromArray(operations)(of(event))) : of(cacheData);
      }),
      filter((data) => {
        const canPass = !((data === null) || (typeof data === "undefined"));
        const pushHeaders = rxStore.pushHeadersMap[type];
        const event = pushHeaders.event;
        const hasModified = event.hasModified;
        if (canPass) {
          obs$$.lastModifyId = pushHeaders.lastModifyId;
        }
        if (canPass && hasModified) {
          switch (options.cacheType) {
            case "eventCache":
              rxStore.dataMap[type] = data;
              break;
            case "pagingCache":
              redis.storePagingData({
                key: `pagingData-${type}`,
                pageNum: event.payload[event.options.paginationFields.pageNum],
                pageSize: event.payload[event.options.paginationFields.pageSize]
              }, data.list);
              break;
          }
        }
        setTimeout(function () { NProgress.done(); }, 20);
        return canPass;
      })
    );
    _subscription = _obs$.subscribe(obs$$);
    return obs$$;
  }
  const processEvent$ = generateObs(event$);

  processEvent$.pipe = function () {
    for (var i = 0; i < arguments.length; i++) {
      operations.push(arguments[i]);
    }
    return generateObs(event$);
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

  let options = param1 || {};

  const handler = function(Comp) {
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
          const subscription = obsArr[i].subscribe(data => {
            const type = obsArr[i]["__type__"];
            const pushHeaders = rxStore.pushHeadersMap[type];

            if (options.delayeringFields && options.delayeringFields.includes(suspendedObservableKeys[i])) {
              const _stateObj = {};
              for (const key in data) {
                if (this.state[key] !== data[key]){
                  _stateObj[key] = data[key];
                }
              }
              // if (isCorrectVal(pushHeaders))  console.log(pushHeaders);
              this.setState(_stateObj);
              return;
            }

            if (this.state[suspendedObservableKeys[i]] !== data) {
              // if (isCorrectVal(pushHeaders))  console.log(pushHeaders);
              this.setState({
                [suspendedObservableKeys[i]]: data,
              });
            }
          });
          this.subscriptionArr.push(subscription);
        }
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

