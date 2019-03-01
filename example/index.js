import { attract, distributor$ } from "../src/index.js";
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";

const test$ = attract("test");
test$.subscribe(data => {
  console.log(data);
});
distributor$.next("test");