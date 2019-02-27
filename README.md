# rx-samsara

一个`react`应用的数据流管理框架<br>
它是在**响应式编程**`js`库 `RxJS 6` 的基础上开发的，并且在使用时也需要依赖于`rxjs`的`observable`；<br>
在`rx-samsara`的世界里，`observable`是基本单元(数据类型)，就像 `function`之于`javascript`。<br>

[源码地址: https://github.com/shayeLee/rx-samsara](https://github.com/shayeLee/rx-samsara)
[文档地址: https://shayelee.github.io/rx-samsara/](https://shayelee.github.io/rx-samsara/)

## 安装

通过 npm

```
$ npm install rx-samsara --save
```

## 如何使用

创建一个`observable`

```javascript
// testData.js

import { from } from "rxjs";

const testData$ = from(
  new Promise(resolve => {
    setTimeout(() => {
      resolve(123);
    }, 800);
  })
);

export default testData$;
```

创建一个名为`CompA`的`react`组件来消费可观察对象`testData$`<br>
注解`permeate`会提供观察者订阅以键值对传入的`observable`，并将观察者接收到的值根据对应的`key`转化为组件的`props`

```javascript
// compA.jsx

import { permeate } from "rx-samsara";
import testData$ from "testData";

@permeate({ testData: testData$ })
class CompA extends React.Component {
  render() {
    // this.props.testData === 123
    return <div>{this.props.testData}</div>;
  }
}
```

还可以再创建一个名为`CompB`的`react`组件，同样也来消费可观察对象`testData$`;

```javascript
// compB.jsx

import { permeate } from "rx-samsara";
import testData$ from "testData";

@permeate({ testData: testData$ })
class CompB extends React.Component {
  render() {
    // this.props.testData === 123
    return <div>{this.props.testData}</div>;
  }
}
```

可观察对象`testData$`是可以供任何组件消费的，并且不受个数限制，当有组件使用的时候，`testData$`推送的数据会被转化为组件的属性(或更新已有的属性)。<br>
但是我们可能会遇到这样的场景：在组件完成初始渲染之后，某些时刻需要更新`this.props.testData`的值。<br>
这种场景下可以使用事件触发器`distributor$`，它提供了一个`next`函数使用户能够手动推送事件，然后我们需要对`testData$`做一些改造，使之能够接受`distributor$`推送的事件。

```javascript
// testData.js

import { distributor$, attract } from "rx-samsara";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";

// attract() 可以捕捉事件触发器推送的指定类型的事件，并返回一个包含值为该事件对象的observable
const testData$ = attract("refreshData").pipe(
  switchMap(event => {
    return from(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(456);
        }, 800);
      })
    );
  })
);

export default testData$;
```

当`distributor$`推送对应事件后，testData$ 就会向所有观察者推送数据(更新组件属性)

```javascript
// compA.jsx

import { distributor$, permeate } from "rx-samsara";
import testData$ from "testData";

@permeate({ testData: testData$ })
class CompA extends React.Component {
  render() {
    // distributor$ 推送事件之后 this.props.testData === 456
    return (
      <div>{this.props.testData}</div>
    )
  },
  componentDidMount() {
    distributor$.next("refreshData");
  }
}
```
