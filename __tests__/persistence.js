import { persistence, __rxStore__ } from "../src/index.js";
import { fromPromise } from "rxjs/internal/observable/fromPromise";

const obs$ = fromPromise(persistence("test", 123, () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(456);
    }, 1000)
  })
}))

test("测试 persistence 是否能正常获取异步数据", (done) => {
  obs$.subscribe(val => {
    expect(val).toBe(456);
    done();
  })
})

test("测试 persistence 是否能将数据持久化", (done) => {
  obs$.subscribe(val => {
    expect(__rxStore__.test).toBe(456);
    done();
  })
})

test("测试 persistence 的默认值参数是否有效", (done) => {
  const default$ = fromPromise(persistence("test", 123, () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 1000)
    })
  }, { refresh: true }))

  default$.subscribe(val => {
    expect(val).toBe(123);
    done();
  })
})