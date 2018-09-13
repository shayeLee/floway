# rx-samsara
一个`react`应用的数据流管理框架<br>
它是在**响应式编程**的`js`库 `RxJS 6` 的基础上开发的，并且在使用时也需要依赖于`rxjs`的`observable`；<br>
在`rx-samsara`的世界里，`observable`是基本单元，就像 `function`之于`javascript`。<br>

[API文档](https://www.kancloud.cn/capricorn_pj/rxjs/762141)

## 安装
通过 npm
```
$ npm install rx-samsara --save
```

## 如何使用
创建一个`observable`，这个`observable`可以供任何的组件消费
```javascript
/** testData.js */
import { fromPromise } from "rxjs/internal/observable/fromPromise";

// 用 promise 模拟异步请求
function getData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(123);
    }, 800)
  })
}

const testData$ = fromPromise(getData())

export default testData$;
```
创建一个名为`CompA`的`react`组件来消费可观察对象`testData$`<br>
`permeate()`会自动订阅（调用）一次传入的`observable`，并将它包含的值根据对应的`key`转化为组件的`props`
```javascript
/** compA.jsx */
import { permeate } from "rx-samsara";
import testData$ from "testData";

class CompA extends React.Component {
  render() {
    // this.props.testData === 123
    return (
      <div>{this.props.testData}</div>
    )
  }
}

export permeate({ testData: testData$ })(CompA);
```
还可以再创建一个名为`CompB`的`react`组件，同样也来消费可观察对象`testData$`;
```javascript
/** compB.jsx */
import { permeate } from "rx-samsara";
import testData$ from "testData";

class CompB extends React.Component {
  render() {
    // this.props.testData === 123
    return (
      <div>{this.props.testData}</div>
    )
  }
}

export permeate({ testData: testData$ })(CompB);
```
可观察对象`testData$`是可以供任何组件消费的，并且不受个数限制，但是对于同一个消费者它只会推送一次数据（当有观察者订阅的时候，`testData$`会主动向该观察者推送一次数据）；<br>
这样可能会带来一个问题：在组件完成初始渲染之后，`this.props.testData`将永远无法更新数据，除非组件卸载重装；<br>
如何解决这个问题？<br>
这个问题可以用事件触发器`distributor$`来解决，它提供了一个`next`函数使用户能够手动推送事件，然后我们需要对`testData$`做一些改造，使之能够接受`distributor$`推送的事件。
```javascript
/** testData.js */
import { distributor$, attract } from "../src/index.js";
import { switchMap } from "rxjs/operators";
import { fromPromise } from "rxjs/internal/observable/fromPromise";

// 用 promise 模拟异步请求
function getData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(456);
    }, 800)
  })
}

// attract() 可以捕捉事件触发器推送的指定类型的事件，并返回一个包含值为该事件对象的observable
const testData$ = attract("refreshData", 123).pipe(
  switchMap(event => {
    return fromPromise(getData());
  })
);

/**
 * 改造后的 testData$ 与原先的区别：
 * 一. 在distributor$未推送对应的事件之前：
 *     1. 只有在有设置默认值的情况下，观察者订阅的时候，testData$ 才会推送数据；
 *     2. 没有设置默认值的情况下，观察者即使订阅，也将不会收到推送；
 * 二. 在distributor$已推送对应的事件至少一次之后：
 *     1. testData$ 会缓存最近一次推送的数据，有观察者订阅就直接推送。
 *     2. 当 distributor$ 再一次推送事件，所有的观察者都将接收到最新的数据
 */  
export default testData$;
```
```javascript
/** compA.jsx */
import { distributor$, permeate } from "rx-samsara";
import testData$ from "testData";

class CompA extends React.Component {
  render() {
    // this.props.testData === 123
    // distributor$ 推送事件之后 this.props.testData === 456
    return (
      <div>{this.props.testData}</div>
    )
  },
  componentDidMount() {
    distributor$.next("refreshData");
  }
}

export permeate({ testData: testData$ })(CompA);
```
