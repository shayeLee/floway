import { map, combineLatest } from "rxjs/operators";

const ofLast = function(obs$) {
  return obs$.pipe(
    combineLatest(),
    map(arr => arr[0])
  );
};
export default ofLast;
