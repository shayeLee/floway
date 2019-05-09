import { isCorrectVal, isObject } from './utils';
import { isObservable, defer, of, merge } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import eventBus from './eventBus';
import fromAction from './fromAction';
import StateSubject from "./stateSubject";
import store from './store';
const stateMap = store.stateMap;

class StateMachine {
  value = null;
  constructor(state$, options) {
    this.name = options.name;
    if (isCorrectVal(stateMap[this.name])) {
      throw new Error(`名为'${this.name}'的状态数据已存在，不能重复创建！`);
    }

    this.defaultValue = options.defaultValue;
    this.value = options.defaultValue;
    this.initial$ = isObservable(options.initial) ? options.initial : of(this.value);
    if (isCorrectVal(options.producer)) {
      this._producer = options.producer;
      const observableFactory = action => {
        if (!isObject(action)) {
          return of(action);
        } else if (isObject(action) && isCorrectVal(action.type)) {
          return defer(() => {
            const _result = action.result;
            return isObservable(_result) ? _result : of(_result);
          });
        }
      };
      this.subscription = merge(this.initial$, fromAction(this.name))
        .pipe(switchMap(observableFactory))
        .subscribe(
          val => {
            this.value = val;
            state$.next(val);
          },
          err => state$.error(err)
        );
    } else {
      this.initial$.subscribe(
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
  const state$ = new StateSubject();
  const stateMachine = new StateMachine(state$, options);
  stateMap[options.name] = stateMachine;
  return state$;
}

export default state;
