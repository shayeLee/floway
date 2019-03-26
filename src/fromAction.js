import { isCorrectVal } from "./utils";
import store from "./store";
const eventLog = store.eventLog;
import { Subject, of } from "rxjs";
import { pluck, filter, switchMap } from "rxjs/operators";
import { pipeFromArray } from "rxjs/internal/util/pipe";
import eventBus from "./eventBus";

const fromAction = function(type, options) {
  if (!(typeof type === "string")) {
    throw new Error("action's type must be string");
  }

  const _options = {
    useCache: false,
    cacheType: "eventCache" // eventCache itemCache
  };
  options = Object.assign({}, _options, options);

  const event$ = eventBus.pipe(
    pluck(type),
    filter(event => {
      if (!isCorrectVal(event)) return false;

      if (!isCorrectVal(event.payload)) event.payload = {};
      if (!isCorrectVal(event.options)) event.options = {};

      if (!isCorrectVal(eventLog.pushHeadersMap[event.type])) {
        eventLog.pushHeadersMap[event.type] = {
          event,
          lastModifyId: new Date().getTime()
        };
        return true;
      }

      const pushHeaders = eventLog.pushHeadersMap[event.type];
      const lastEvent = pushHeaders.event;

      // 判断是否要更新lastModifyId
      if (
        !options.useCache ||
        (JSON.stringify(lastEvent.payload) !== JSON.stringify(event.payload) ||
          JSON.stringify(lastEvent.options) !== JSON.stringify(event.options))
      ) {
        eventLog.pushHeadersMap[event.type][
          "lastModifyId"
        ] = new Date().getTime();
      }
      pushHeaders.event = event;
      return true;
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
        const pushHeaders = eventLog.pushHeadersMap[event.type];
        let hasModified = obs$$.lastModifyId !== pushHeaders.lastModifyId;

        // 判断是否有缓存数据
        let cacheData;
        if (options.useCache && !hasModified) {
          switch (options.cacheType) {
            case "eventCache":
              cacheData = eventLog.dataMap[event.type];
              if (!isCorrectVal(cacheData)) {
                hasModified = true;
                pushHeaders.lastModifyId = new Date().getTime();
              }
              break;
          }
        }
        event.hasModified = hasModified;
        return hasModified
          ? operations.length === 0
            ? of(event)
            : pipeFromArray(operations)(of(event))
          : of(cacheData);
      }),
      filter(data => {
        const canPass = !(data === null || typeof data === "undefined");
        const pushHeaders = eventLog.pushHeadersMap[type];
        const event = pushHeaders.event;
        const hasModified = event.hasModified;
        if (canPass) {
          obs$$.lastModifyId = pushHeaders.lastModifyId;
        }

        // 缓存数据
        if (canPass && hasModified) {
          switch (options.cacheType) {
            case "eventCache":
              eventLog.dataMap[type] = data;
              break;
          }
        }

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

export default fromAction;
