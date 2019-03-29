import eventBus from "./eventBus";
import { isCorrectVal } from "./utils";
import store from './store';
const producerMap = store.producerMap;

const dispatch = function(stateName, action) {
  /* if (!Array.isArray(actions)) {
    actions = [actions];
  }
  const map = {};
  actions.forEach(action => {
    if (typeof action === "string") {
      const type = action;
      action = { type };
    }
    action.type = `${stateName}#${action.type}`;

    map[action.type] = action;
  });
  eventBus.next(map); */

  const global = !isCorrectVal(producerMap[stateName]);
  let _action = global ? stateName : action;

  if (typeof _action === "string") {
    const type = _action;
    _action = { type };
  }
  if (global) {
    for (let key in producerMap) {
      producerMap[key](Object.assign({}, _action, { global: true }));
    }
    return;
  }
  producerMap[stateName](_action);
}

export default dispatch;
