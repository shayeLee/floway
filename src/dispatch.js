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

  if (typeof action === "string") {
    const type = action;
    action = { type };
  }

  producerMap[stateName](action);
}

export default dispatch;
