# Floway的自述

> 随着前端应用的复杂度越来越高，如何管理应用的数据已经是一个不可回避的问题。当你面对的是**业务场景复杂、需求变动频繁、各种应用数据互相关联依赖**的大型前端应用时，你会如何去管理应用的状态数据呢？

我们认为应用的数据大体上可以分为四类：

- 事件：瞬间产生的数据，数据被消费后立即销毁，不存储。
- 异步：异步获取的数据；类似于事件，是瞬间数据，不存储。
- 状态：随着时间空间变化的数据，始终会存储一个当前值/最新值。
- 常量：固定不变的数据。

`RxJS`天生就适合编写异步和基于事件的程序，那么状态数据用什么去管理呢？还是用`RxJS`吗？ 合不合适呢？

我们去调研和学习了前端社区已有的优秀的状态管理解决方案，也从一些大牛分享的关于用`RxJS`设计数据层的构想和实践中得到了启发：

1. 使用`RxJS`完全可以实现诸如`Redux`,`Mobx`等管理状态数据的功能。
2. 应用的数据不是只有状态的，还有事件、异步、常量等等。如果整个应用都由`observable`来表达，则可以借助`RxJS`基于序列且可响应的的特性，以流的方式自由地拼接和组合各种类型的数据，能够更优雅更高效地抽象出可复用可扩展的业务模型。

出于以上两点原因，最终决定基于`RxJS`来设计一套管理应用的状态的解决方案。


## 原理介绍

对于状态的定义，通常认为状态需要满足以下3个条件：
1. 是一个具有多个值的集合。
2. 能够通过`event`或者`action`对值进行转换，从而得到新的值。
3. 有“当前值”的概念，对外一般只暴露当前值，即最新值。

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

## 简单实现

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

实现方法挺简单的，就是使用`BehaviorSubject`来表达状态的当前值；通过调用`dispatch`函数使`producer`函数执行，而`producer`函数在内部调用了`BehaviorSubject`的`next`函数，推送了新数据，`BehaviorSubject`的当前值更新了，也就是状态更新了。
