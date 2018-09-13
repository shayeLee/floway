import { distributor$, attract } from "../src/index.js";
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";

test("测试 attract() 有传defaultValue", (done) => {
  const obs$ = attract("test eventType", { type: "test eventType" }).pipe(switchMap(event => {
    return of(event.type);
  }));
  
  obs$.subscribe(data => {
    expect(data).toEqual({ type: "test eventType" });
    done();
  })
})

test("测试 attract() 省略defaultValue", (done) => {
  const obs$ = attract("test eventType").pipe(switchMap(event => {
    return of(event.type);
  }));

  distributor$.next("test eventType");
  
  obs$.subscribe(type => {
    expect(type).toBe("test eventType");
    done();
  })
})