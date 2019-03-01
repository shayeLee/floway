### distributor\$

!> 全局事件管理对象，整个应用只有一个。

#### event

- 类型: `object`
- 属性:
  - `{string} type` 事件类型
  - `{*} payload` 事件载荷数据
  - `{object} options` 自定义选项

#### distributor\$.next(events)

- 参数:
  - `{objectArray} events`
- 用法:<br>
  推送一个或者多个事件，这些事件可以用 [attract](/?id=attracttype) 函数来接收。
- 示例:

  ```javascript
  import { distributor$ } from "rx-samsara";

  distributor$.next({
    type: "eventName"
  });
  ```

  如果事件对象只有一个`type`属性，那么可以简写成字符串

  ```javascript
  import { distributor$ } from "rx-samsara";

  distributor$.next("eventName");
  ```

  同时推送多个事件

  ```javascript
  import { distributor$ } from "rx-samsara";

  distributor$.next([
    {
      type: "eventName1",
      payload: { data: 1 }
    },
    {
      type: "eventName2"
    }
  ]);
  ```

### attract(type)

- 参数:
  - `{object} type` 事件类型
    - `{string} type` 相当于 event.type
    - `{boolean} [useCache=false]` 是否使用缓存
    - `{string} [cacheType="eventCache"]` 缓存类型
      - "eventCache": 事件缓存
      - "itemCache": 单项缓存
- 用法:<br>

  ?> 捕捉`distributor$`推送的指定类型的事件，并返回一个 observable

- 示例:

  ```javascript
  import { attract, distributor$ } from "rx-samsara";
  import { of } from "rxjs";
  import { switchMap } from "rxjs/operators";

  // 如果事件类型对象只有一个 type 属性，则可以简写成字符串
  const obs$ = attract("testEvent").pipe(
    switchMap(event => {
      return of("testData");
    })
  );

  obs$.subscribe(val => {
    console.log(val); // log: testData
  });

  distributor$.next("testEvent");
  ```

### permeate(observablesMap, [inputOptions])

- 参数:
  - `{object} observablesMap` 可观察对象集合
  - `{object} inputOptions` 选项
    - `{object} defaultProps` 组件的初始属性
    - `{array} delayeringFields` 推送数据需要扁平化的可观察对象的key
- 返回值: `{function} componentFactory(component)`
- 用法:<br>

  ?> observable 与 react 组件的集成(将 observable 转换为组件属性)

- 示例:

  ```javascript
  import { permeate } from "rx-samsara";
  import { from } from "rxjs";

  const testData$ = from(
    new Promise(resolve => {
      setTimeout(() => {
        resolve(123);
      }, 800);
    })
  };

  @permeate({ testData: testData$ })
  class CompA extends React.Component {
    render() {
      // this.props.testData === 123
      return <div>{this.props.testData}</div>;
    }
  }
  ```

### ofLast(obs$)

- 参数:
  - `{observable} obs$`
- 返回值: `{observable}`
- 用法:<br>
  根据传入的`observable`的最新推送数据创建一个新的`observable`

