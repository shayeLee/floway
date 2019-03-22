import { BehaviorSubject } from "rxjs";

function state(options) {
  let value = options.value;
  const stateSubject = new BehaviorSubject(value);

  /* Object.keys(options.actions).forEach(key => {
    console.log(key);
  }); */

  return stateSubject;
}

export default state;
