import { BehaviorSubject } from 'rxjs';

class StateMachine {
  constructor(subject, value) {
    this.subject = subject;
    this.value = value;
  }

  producer(action) {
    let oldValue = this.value;
    let newValue;
    switch (action.type) {
      case 'plus':
        newValue = ++oldValue;
        this.value = newValue;
        this.subject.next(newValue);
        break;
      case 'toDouble':
        newValue = oldValue * 2;
        this.value = newValue;
        this.subject.next(newValue);
        break;
    }
  }
}

const value = 1;
const count$ = new BehaviorSubject(value);
const stateMachine = new StateMachine(count$, value);

function dispatch(action) {
  stateMachine.producer(action);
}

count$.subscribe(val => {
  console.log(val);
});

setTimeout(() => {
  dispatch({
    type: 'plus'
  });
}, 1000);

setTimeout(() => {
  dispatch({
    type: 'toDouble'
  });
}, 2000);
