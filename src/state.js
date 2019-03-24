import { isCorrectVal } from "./utils";
import { isObservable, BehaviorSubject, defer, merge, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import fromAction from './fromAction';
import store from './store';
const stateTree = store.stateTree;
const subscriptions = store.subscriptions;
const stateRegister = store.stateRegister;

function state(options) {
  const name = options.name;

  if (stateRegister[name] === true) {
    throw new Error(`名为'${name}'的状态数据已存在，不能重复创建！`);
  }
  stateRegister[name] = true;

  stateTree[name] = options.value;
  const actions = options.actions;
  const state$ = new BehaviorSubject(options.value);

  if (isCorrectVal(actions)) {
    const obsArr = [];
    Object.keys(actions).forEach(key => {
      obsArr.push(
        fromAction(`${name}#${key}`).pipe(
          switchMap(action => {
            return defer(() => {
              const _result = actions[key](action, stateTree[name]);
              return isObservable(_result) ? _result : of(_result);
            });
          })
        )
      );
    });

    subscriptions[name] = merge(...obsArr).subscribe(
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
