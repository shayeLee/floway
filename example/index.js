import { fromPromise } from "rxjs/internal/observable/fromPromise";
import { switchMap } from "rxjs/operators";
import { distributor$, attract } from "../src/index";

// 用 promise 模拟异步请求
function getData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(123);
    }, 800)
  })
}

const testData$ = attract("refreshData", 456).pipe(
  switchMap(() => {
    return fromPromise(getData());
  })
)

distributor$.next("refreshData");

testData$.subscribe(val => {
  console.log(val);
});

setTimeout(() => {
  testData$.subscribe(val => {
    console.log("7 + " + val);
  });
}, 2000)

