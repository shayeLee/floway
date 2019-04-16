import { Observable } from 'rxjs';

function StateSubject(value) {
  this.observerList = [];
  this.value = value;
}
StateSubject.prototype = Object.create(
  Observable.create(function(observer) {
    if (typeof this.value !== "undefined") observer.next(this.value);
    this.observerList.push(observer);
  })
);
StateSubject.prototype.next = function(val) {
  this.value = val;
  this.observerList.forEach(observer => {
    observer.next(val);
  });
};

export default StateSubject;
