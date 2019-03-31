# Floway的概念与原理

> 随着前端应用的复杂度越来越高，如何管理应用的数据已经是一个不可回避的问题。当你面对的是有着**大量的异步数据更新、数据之间还互相有依赖关系**的大型前端应用时，你会如何去管理应用的数据流呢？
我们调研和学习了一些已有的优秀的状态管理解决方案，也从一些大牛分享的关于用`RxJS`设计数据层的构想和实践中得到了启发，最终选择基于`RxJS`设计一套数据流管理的解决方案。

我们认为应用的数据大体上可以分为三类：
- 状态：随着时间空间变化的数据，始终会存储一个当前值/最新值。
- 事件：瞬间产生的数据，数据被消费后立即销毁，不存储。
- 常量：固定不变的数据。

那么选择`RxJS`的原因就显而易见了：
1. 使用`RxJS`完全可以实现诸如`Redux`,`Mobx`等管理状态数据的功能。
2. 应用的数据不是只有状态的，还有事件、常量等等。如果整个应用都由`observable`来表达，则可以借助`RxJS`基于序列且可响应的的特性，以流的方式自由地拼接和组合状态、事件、常量等数据，能够更优雅更高效地抽象出可复用可扩展的应用数据流。

所以，本文将会围绕上面提到的两个问题来展开。


## 一、管理应用的状态数据

对于状态的定义，通常认为状态需要满足以下3个条件：
1. 是一个具有多个值的集合。
2. 
3. 能够通过`event`或者`action`对值进行转换，从而得到新的值。
4. 有“当前值”的概念，对外一般只暴露当前值，即最新值。

那么，`RxJS`适合用来管理状态数据吗？答案是肯定的！

**首先，因为`Observable`本身就是多个值的推送集合，所以第一个条件是满足的！**

**其次，我们可以实现一个使用`dispatch action`模式来推送数据的`observable`来满足第二个条件!**

众所周知，`RxJS`中的`observable`可以分为两种类型：
1. `cold observable`: 推送值的生产者(`producer`)来自`observable`内部。
    - 将会推送几个值以及推送什么样的值已在`observable`创建时被定义下来，不可改变。
    - `producer`与观察者(`observer`) 是一对一的关系，即是单播的。
    - 每当有`observer`订阅时，`producer`都会把预先定义好的若干个值依次推送给`observer`。
2. `hot observable`: 推送值的`producer`来自`observable`外部。
    - 将会推送几个值、推送什么样的值以及何时推送在创建时都是未知的。
    - `producer`与`observer`是一对多的关系，即是多播的。
    - 每当有`observer`订阅时,会将`observer`注册到观察者列表中，类似于其他库或语言中的`addListener`的工作方式。
    - 当外部的`producer`被触发或执行时，会将值同时推送给所有的`observer`；也就是说，所有的`observer`共享了`hot observable`推送的值。
    
`RxJS`提供的`BehaviorSubject`就是一种特殊的`hot observable`，它向外暴露了推送数据的接口`next`函数；并且有“当前值”的概念，它保存了发送给`observer`的最新值，当有新的观察者订阅时，会立即从`BehaviorSubject`那接收到“当前值”。

**那么这说明使用`BehaviorSubject`来更新状态并保存状态的当前值是可行的，第三个条件也满足了。**

请看以下的代码:

```javascript
import { BehaviorSubject } from 'rxjs';

// 数据推送的生产者
class StateMachine {
  constructor(subject, value) {
    this.subject = subject;
    this.value = value;
  }

  producer(action) {
    let oldValue = this.value;
    let newValue;
    switch (action.type) {
      case 'plus':
        newValue = ++oldValue;
        this.value = newValue;
        this.subject.next(newValue);
        break;
      case 'toDouble':
        newValue = oldValue * 2;
        this.value = newValue;
        this.subject.next(newValue);
        break;
    }
  }
}

const value = 1;  // 状态的初始值
const count$ = new BehaviorSubject(value);
const stateMachine = new StateMachine(count$, value);

// 派遣action
function dispatch(action) {
  stateMachine.producer(action);
}

count$.subscribe(val => {
  console.log(val);
});

setTimeout(() => {
  dispatch({
    type: "plus"
  });
}, 1000);

setTimeout(() => {
  dispatch({
    type: "toDouble"
  });
}, 2000);

```

执行代码控制台会打印出三个值:

```
Console

 1
 2
 4
```

上面的代码简单实现了一个简单管理状态的例子:
- 状态的初始值: 1
- 执行`plus`之后的状态值: 2
- 执行`toDouble`之后的状态值: 4

不过写起来略微繁琐，我们对其进行了封装，最终的写法被优化成如下所示:

### 定义状态

使用创建操作符`state`创建`stateObservable`

```javascript
const count$ = state({
  // 状态的唯一标识名称
  name: "count",
    
  // 状态的默认值
  defaultValue: 1,
    
  producer(next, value, action) {
    switch (action.type) {
      case "plus":
        next(value + 1);
        break;
      case "toDouble":
        next(value * 2);
        break;
    }
  }
});
```

### 更新状态

在你想要的任意位置派遣`action`

```javascript
dispatch("count", {
  type: "plus"
})
```

### 听说需要异步action？不存在的！



具体的实现可以[点击这里](https://github.com/shayeLee/floway/blob/master/src/state.js)查看源码，想知道更详细的使用方法可以[点击这里](https://shayelee.github.io/floway/#/?id=%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B)查看文档。



##二、管理应用的数据流 

