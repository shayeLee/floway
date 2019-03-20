# Floway

**`Floway`是`flow-way`的简写，意为数据流的流动轨道！**<br>
她是`RxJS v6`的扩展库，主要功能是作为`React`应用的状态(数据流)管理工具。

## 安装

通过 npm

```
$ npm install floway --save
```

## 开始使用

#### 1. React组件订阅`observable`
使用`subscription`装饰器可以订阅`observable`，它会将`observable`推送的数据转换为React组件的`props`

```jsx
import { of } from "rxjs";
import { subscription } from "floway";
import React from "react";

const observable = of("react's flow-way");

@subscription({
  floway: observable
})
class TestComponent extends React.Component {
  render() {
    console.log(this.props.floway === "react's flow-way");  // log: true
    return (
      <div>{this.props.floway}</div>
    )
  }
}
```

#### 2. 使用`stateSubject`来更新组件的`props`
`subject`在`RxJS`中是一种特殊的`observable`<br>
而`stateSubject`是由`floway`自定义的一种特殊的`subject`<br>
`stateSubject`可以通过`dispatch action`的模式来推送新的数据<br>
使用`State`构造函数能够将普通`observable`转换为`stateSubject`<br>

```jsx
import { of } from "rxjs";
import { subscription, State } from "floway";
import React from "react";

const observable = of(1);

const stateSubject = new State(observable);

// 注册action
stateSubject.registerAction("plus", count => ++count);

@subscription({
  count: stateSubject
})
class TestComponent extends React.Component {
  render() {
    return (
      /**
       * this.props.count初始值为1
       * 每点击按钮一次，this.props.count值加1
      */
      <div>
        <div>{this.props.count}</div>
        <button onClick={this.plus}>plus one</button>
      </div>
    )
  }

  plus() {
    stateSubject.dispatch("plus");
  }
}
```

