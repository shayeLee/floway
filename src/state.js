import { BehaviorSubject } from "rxjs";

/**
 * @param {observable} observable - 只能是observable，不能是subject
*/
function State(observable) {
  this.actionMap = {};

  this.registerAction = (name, func) => {
    this.actionMap[name] = func;
  }
  this.dispatch = (name, payload) => {
    const newValue = this.actionMap[name](this.value, payload);
    this.next(newValue);
  }
  this.init = this.regain = () => {
    observable.subscribe({
      next: val => this.next(val),
      error: err => this.error(err)
    });
  }

  this.init();
}
State.prototype = Object.create(new BehaviorSubject);

export default State;
