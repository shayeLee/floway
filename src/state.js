import { isCorrectVal } from './utils';
import { isObservable, BehaviorSubject, defer, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import eventBus from './eventBus';
import fromAction from './fromAction';
import store from './store';
const stateMap = store.stateMap;

class StateMachine {
  constructor(state$, options) {
    this.name = options.name;
    if (isCorrectVal(stateMap[this.name])) {
      throw new Error(`名为'${this.name}'的状态数据已存在，不能重复创建！`);
    }

    this.value = options.value;
    if (isCorrectVal(options.producer)) {
      this._producer = options.producer;
      const observableFactory = action => {
        return defer(() => {
          const _result = action.result;
          return isObservable(_result) ? _result : of(_result);
        });
      };
      this.subscription = fromAction(this.name)
        .pipe(switchMap(observableFactory))
        .subscribe(
          val => {
            this.value = val;
            state$.next(val);
          },
          err => state$.error(err)
        );
    }
  }

  producer(action) {
    this._producer(
      result => {
        eventBus.next({
          [this.name]: Object.assign({}, action, { type: this.name, result })
        });
      },
      this.value,
      action
    );
  };
}

function state(options) {
  const state$ = new BehaviorSubject(options.value);
  const stateMachine = new StateMachine(state$, options);
  stateMap[options.name] = stateMachine;
  return state$;
}

export default state;
