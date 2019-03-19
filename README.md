# Floway

**`Floway`是`flow-way`的简写，意为数据流的流动轨道！**<br>
她是`RxJS v6`的扩展库，主要功能是作为`React`应用的状态(数据流)管理工具。

## 安装

通过 npm

```
$ npm install floway --save
```

## 开始使用

##### 将observable绑定到React组件

```jsx
import { of } from "rxjs";
import { permeate } from "floway";
import React from "react";

const observable = of("react's flow-way");

/**
 * permeate是一个装饰器，能够将observable推送的数据转换为React组件的属性
*/
@permeate({
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

##### 使用`stateSubject`来更新组件的状态

```jsx
import { of } from "rxjs";
import { permeate, State } from "floway";
import React from "react";

const observable = of(1);

/**
 * State构造函数能够将普通observable转换为stateSubject
 * stateSubject是由floway自定义的一种特殊的Subject，它可以通过'dispatch action'的模式来推送新的数据
*/
const stateSubject = new State(observable);

// 注册action
stateSubject.registerAction("plus", count => ++count);

@permeate({
  count: stateSubject
})
class TestComponent extends React.Component {
  render() {
    return (
      /**
       * this.props.count初始值为1
       * 每点击按钮一次，this.props.count值加1
      */
      <div>{this.props.count}</div>
      <button onClick={this.plus}>plus one</button>
    )
  }

  plus() {
    stateSubject.dispatch("plus");
  }
}
```

## 文档

[https://shayelee.github.io/floway/](https://shayelee.github.io/floway/)

