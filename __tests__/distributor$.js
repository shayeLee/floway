import { distributor$, attract } from "../src/index.js";

test("测试distributor$.next(string)", (done) => {
  const obs$ = attract("eventType");

  distributor$.next("eventType");

  obs$.subscribe(event => {
    expect(event).toEqual({ type: "eventType" });
    done();
  })
})

test("测试distributor$.next(object)", (done) => {
  const obs$ = attract("eventType");

  distributor$.next({ type: "eventType" });

  obs$.subscribe(event => {
    expect(event).toEqual({ type: "eventType" });
    done();
  })
})

test("测试distributor$.next(objectArray)", (done) => {
  const obs$ = attract("eventType");

  distributor$.next([{ type: "eventType" }]);

  obs$.subscribe(event => {
    expect(event).toEqual({ type: "eventType" });
    done();
  })
})