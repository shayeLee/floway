import { distributor$, attract, ofHot } from "../src/index.js";
import { switchMap } from 'rxjs/operators';

const test$ = ofHot(666)();
test$.subscribe(data => {
  console.log(data);
});

setTimeout(() => {
  test$.update(888);
}, 1000)