/**
 * 全局事件触发器
*/

import eventBus from "./eventBus";
import { isCorrectVal } from "./utils";

const dispatch = function(stateName, actions) {
  if (!Array.isArray(actions)) {
    actions = [actions];
  }
  const map = {};
  actions.forEach(action => {
    if (typeof action === "string") {
      const type = action;
      action = { type };
    }
    action.type = `${stateName}#${action.type}`;

    if (!isCorrectVal(action.payload)) action.payload = {};
    if (!isCorrectVal(action.options)) action.options = {};

    map[action.type] = action;
  });
  eventBus.next(map);
}

export default dispatch;
