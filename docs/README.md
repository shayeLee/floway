# Floway

基于 `RxJS v6` 的前端应用状态管理解决方案。<br>
**我们为你提供了两个函数让你能够轻松地管理状态数据；是的，你没看错，只有两个函数！**
- 一个操作符函数: `state`
- 一个普通函数: `dispatch`

## [自述](/presentation.md)

## 安装

```
$ npm install floway --save
```

## 使用教程

[demo 演示](https://shayelee.github.io/floway/example/todoList/index.html ":ignore")
<br>
[RxJS 相关概念](/concept.md)

### 定义状态

使用创建操作符`state`创建**`stateObservable`**。这是一个特殊的`observable`，可以通过`dispatch action`的模式来推送新数据(更新状态)。

```javascript
import { state } from "floway";

const todos$ = state({
  name: "todos",
  defaultValue: [
    {
      desc: "起床迎接新的一天",
      check: true
    },
    {
      desc: "到达公司开始新一天的工作",
      check: true
    },
    {
      desc: "去公司附近的学校食堂吃午饭",
      check: false
    },
    {
      desc: "下班骑电动车回家",
      check: false
    },
    {
      desc: "吃晚饭，出去吃或者自己做饭吃",
      check: false
    }
  ]
});
```

!> 请注意以上代码中的`name`属性，它是`stateObservable`的唯一标识名称，必须定义。<br>如果标识名称已经被占用，操作符`state`在执行时将会抛出错误！此时你必须重新定义一个。


### 更新状态

`stateObservable` 使用 `dispatch action` 的模式来更新状态(推送新数据)。<br>
首先，请先定义一个`producer`函数来接收`action`。

```javascript
import { state } from "floway";

const todos$ = state({
  
  //...

  producer(next, value, action) {
    const n = action.index;
    const todos = value;
    let newTodos;
    switch (action.type) {
      case "checkItem":
        newTodos = todos.map((item, i) => {
          if (i === n) {
            item.check = !item.check;
          }
          return item;
        });
        next(newTodos);
        break;
    }
  }
});
```

接着，在你想要的任意位置调用`dispatch`，派遣`action`

```javascript
import { dispatch } from "floway";

dispatch("todos", {
  type: "checkItem",
  index: n
});
```

`action`派遣之后，`producer`函数就会执行，从而产生新的值并在调用`next`函数之后发出推送，`stateObservable`的当前值更新，即状态更新。<br>

!> 通过函数`next`推送的数据可以是任何数据类型，包括`observable`！如果是`observable`，不会直接推送，而是推送`observable`内部的值；效果类似于使用`RxJS`操作符`mergeMap`。

### 异步数据

使用`observable`来处理异步数据

#### 指定`observable`作为状态的初始值(首次推送数据)

```javascript
import { state } from "floway";
import { from } from "rxjs";

const todos$ = state({
  name: "todos",
    
  initial: from(getAsyncData())
    
  //...
  
});
```

?> `initial`这个`observable`的内部数据会成为`stateObservable`的初始值。

#### `producer`推送`observable`

```javascript
import { state } from "floway";
import { from } from "rxjs";

const todos$ = state({
  name: "todos",
    
  defaultValue: []
    
  // 数据推送的生产者函数
  producer(next, value, action) {
    switch (action.type) {
      case "getAsyncData":
        next(
          from(getAsyncData())
        );
        break;
    }
  }
});
```

?> 执行`getAsyncData`之后，`from(getAsyncData())`的推送数据将成为状态的最新值。

### 衍生状态

对`stateObservable`使用`RxJS`操作符可以转换得到另一个新的`observable`。效果类似于`Vue`的计算属性。

```javascript
import { map } from "rxjs/operators";

// 未完成任务数量
const undoneCount$ = todos$.pipe(
  map(todos => {
    let _conut = 0;
    todos.forEach(item => {
      if (!item.check) ++_conut;
    });
    return _conut;
  })
);
```

!> 需要注意的是：`stateObservable`在调用`pipe`函数之后，并不会对原本的`stateObservable`做任何修改，而是得到一个新的`observable`，这个新的`observable`推送数据的生产者来自原本的`stateObservable`；<br>也就是说，当原本的`stateObservable`推送数据后，新的`observable`会跟着响应也发出推送。

### 渲染视图

#### React

##### 订阅observable

React视图组件可以通过订阅`observable`以响应所推送的数据从而渲染视图。<br>
使用`@subscription`装饰器可以订阅`observable`，它会将`observable`推送的数据转换为React组件的`props`。

```javascript
import TodoItem from "./todoItem";
import { subscription } from "floway";
import { todos$ } from "./store";

@subscription({
  todos: todos$
})
class TodoList extends React.Component {
  render() {
    return (
      <div className="todolist">
        <h1 className="header">任务列表</h1>
        {this.props.todos.map((item, n) => {
          return <TodoItem item={item} key={item.desc} />;
        })}
      </div>
    );
  }
}
```

##### 多个组件共享数据

假设现在有 `TodoList` 和 `Toast` 这两个组件

```javascript
class Root extends React.Component {
  render() {
    return (
      <div className="root">
        <TodoList />
        <Toast />
      </div>
    );
  }
}
```

多个组件订阅相同的`observable`即可共享数据

```javascript
import { undoneCount$ } from "./store";

@subscription({
  undoneCount: undoneCount$
})
class TodoList extends React.Component {
  render() {
    <div className="todolist">
      <div className="hints">未完成任务数量：{this.props.undoneCount}</div>
    </div>;
  }
}
```

```javascript
import { undoneCount$ } from "./store";

@subscription({
  undoneCount: undoneCount$
})
class Toast extends React.Component {
  render() {
    return (
      <div className="totast__inner">
        恭喜你完成了一个任务，还有 {this.props.undoneCount}{" "}
        个任务未完成，请继续努力。
      </div>
    );
  }
}
```

##### 组件之间的通信

在任意位置调用 `dispatch` 派遣 `action` 皆可更新任意组件的状态

```javascript
import { dispatch } from "floway";

checkItem = () => {
  dispatch("toastVisible", {
    type: "show"
  });
};
```

当状态`toastVisible`的`action show`被派遣后，组件`Toast`就会显示在界面中

```javascript
import { subscription } from "floway";
import { toastVisible$ } from "./store";

@subscription({
  toastVisible: toastVisible$
})
class Toast extends React.Component {
  render() {
    <div
      className="toast"
      style={!this.props.toastVisible ? { display: "none" } : {}}
    >
    </div>;
  }
}
```

## API

[API](./API.md ':include')

## 资源

### [Github 源码](https://github.com/shayeLee/floway ":ignore")
