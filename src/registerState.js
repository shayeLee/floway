// import schema from "async-validator";
import { BehaviorSubject } from "rxjs";
import { isObject } from "shaye-sword";
import store from "./store";
const obsMap = store.obsMap;
const stateTree = store.stateTree;

/**
 * register state
 * @param {object|string} descObject - state's desc
 * @param {string} descObject.name - state's name
 * @param {object} descObject.action - state's action
 * @return {function(observable)} obs$ - observable
 */
function registerState(descObject) {
  let _descObject = {};
  if (typeof descObject === "string") {
    _descObject.name = descObject;
  } else if (isObject(descObject)) {
    _descObject = descObject;
  }

  return function(obs$) {
    const state$ = new BehaviorSubject();
    obs$.subscribe({
      next: data => {
        stateTree[descObject.name] = data;
        state$.next(data);
      },
      error: err => {
        state$.error(err);
      }
    });

    obsMap[descObject.name] = {
      obs$: state$,
      action: descObject.action
    };

    return state$;
  };
}

export default registerState;
