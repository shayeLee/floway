/**
 * 全局事件触发器
 * @namespace distributor$
*/

import eventBus$ from "./eventBus";
import { isCorrectVal } from "./utils";

const distributor$ = {
  /**
   * 推送事件
   * @memberof distributor$
   * @method next
   * @param {string|object|objectArray} events - 事件集合
   * @example
   * import { distributor$ } from "rx-samsara";
   * distributor$.next("eventName");
   * @example
   * import { distributor$ } from "rx-samsara";
   * distributor$.next({
   *   type: "eventName"
   * });
   * @example
   * import { distributor$ } from "rx-samsara";
   * distributor$.next([
   *   {
   *     type: "eventName"
   *   }
   * ]);
  */
  next: function(events) {
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
    eventBus$.next(map);
  }
};
export default distributor$;
