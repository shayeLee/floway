import { isCorrectVal } from "./utils";
import { isObservable, BehaviorSubject, defer, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import eventBus from "./eventBus";
import fromAction from './fromAction';
import store from './store';
const stateTree = store.stateTree;
const subscriptions = store.subscriptions;
const stateRegister = store.stateRegister;
const producerMap = store.producerMap;

function state(options) {
  const name = options.name;

  if (stateRegister[name] === true) {
    throw new Error(`名为'${name}'的状态数据已存在，不能重复创建！`);
  }
  stateRegister[name] = true;

  stateTree[name] = options.value;
  const producer = options.producer;
  const state$ = new BehaviorSubject(options.value);

  producerMap[name] = function(action) {
    producer((result) => {
      eventBus.next({
        [name]: Object.assign({}, action, { type: name, result })
      });
    }, stateTree[name], action);
  }

  if (isCorrectVal(producer)) {
    subscriptions[name] = fromAction(name).pipe(
      switchMap(action => {
        return defer(() => {
          const _result = action.result;
          return isObservable(_result) ? _result : of(_result);
        });
      })
    ).subscribe(
      val => {
        stateTree[name] = val;
        state$.next(val);
      },
      err => state$.error(err)
    );
  }

  return state$;
}

export default state;
