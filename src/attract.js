import { isCorrectVal, isObject } from "./utils";
import rxStore from "./store";
import { Subject, of } from "rxjs";
import { pluck, filter, switchMap } from "rxjs/operators";
import { pipeFromArray } from "rxjs/internal/util/pipe";
import md5 from "js-md5";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import eventBus$ from "./eventBus";
import schema from "async-validator";
import Redis from "../browser-redis/src/index.js";
const redis = new Redis();

/**
 * @param {string|object} type - action类型
 */
const attract = function(type) {
  const validator = new schema({
    type(rule, value, callback) {
      const errors = [];
      if (!((typeof type === "string") || isObject(type))) {
        errors.push(new Error("type must be string or object"));
      }
      callback(errors);
    }
  });
  validator.validate({ type }, (errors) => {
    if (errors) {
      console.error(errors[0]);
    }
  });

  let options = null;
  const _options = {
    useCache: false,
    cacheType: "eventCache" // eventCache pagingCache itemCache
  };

  if (isCorrectVal(type) && typeof type === "string") {
    options = Object.assign({}, _options);
  } else if (isCorrectVal(type) && isObject(type)) {
    options = Object.assign({}, _options, type);
    type = options.type;
    delete options.type;
  }

  const event$ = eventBus$.pipe(
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
            lastModifyId: new Date().getTime()
          };
        } else {
          const pushHeaders = rxStore.pushHeadersMap[event.type];
          const lastEvent = pushHeaders.event;
          // 判断是否要更新lastModifyId
          if (
            !options.useCache ||
            (md5(JSON.stringify(lastEvent.payload)) !==
              md5(JSON.stringify(event.payload)) ||
              md5(JSON.stringify(lastEvent.options)) !==
                md5(JSON.stringify(event.options)))
          ) {
            rxStore.pushHeadersMap[event.type][
              "lastModifyId"
            ] = new Date().getTime();
          }
          pushHeaders.event = event;
        }
        return true;
      }
      return false;
    })
  );

  const operations = [];
  let _subscription = {
    unsubscribe: function() {}
  };
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
                pushHeaders.lastModifyId = new Date().getTime();
              }
              break;
            case "pagingCache":
              // TODO: 判断分页数据是否有缓存数据
              break;
          }
        }
        event.hasModified = hasModified;
        if (!hasModified) NProgress.start();
        return hasModified
          ? operations.length === 0
            ? of(event)
            : pipeFromArray(operations)(of(event))
          : of(cacheData);
      }),
      filter(data => {
        const canPass = !(data === null || typeof data === "undefined");
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
              redis.storePagingData(
                {
                  key: `pagingData-${type}`,
                  pageNum:
                    event.payload[event.options.paginationFields.pageNum],
                  pageSize:
                    event.payload[event.options.paginationFields.pageSize]
                },
                data.list
              );
              break;
          }
        }
        setTimeout(function() {
          NProgress.done();
        }, 20);
        return canPass;
      })
    );
    _subscription = _obs$.subscribe(obs$$);
    return obs$$;
  }
  const processEvent$ = generateObs(event$);

  processEvent$.pipe = function() {
    for (var i = 0; i < arguments.length; i++) {
      operations.push(arguments[i]);
    }
    return generateObs(event$);
  };
  return processEvent$;
};
export default attract;
