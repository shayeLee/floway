// import schema from "async-validator";
import { BehaviorSubject } from 'rxjs';
import { isObject } from 'shaye-sword';
import store from './store';
const obsMap = store.obsMap;
const state = store.state;

/**
 * register state
 * @param {object|string} descObject - state desc
 * @param {string} descObject.name - state name
 * @param {object} descObject.action - state action
 */
function registerState(descObject) {
  let _descObject = {};
  if (typeof descObject === 'string') {
    _descObject.name = descObject;
  } else if (isObject(descObject)) {
    _descObject = descObject;
  }

  return function(obs$) {
    const state$ = new BehaviorSubject();
    obs$.subscribe(data => {
      state[descObject.name] = data;
      state$.next(data);
    });

    obsMap[descObject.name] = {
      obs$: state$,
      action: descObject.action
    };

    return state$;
  };
}

export default registerState;
