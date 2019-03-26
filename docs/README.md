# Floway

基于 `RxJS v6` 的 `React` 应用状态管理解决方案

## 安装

```
$ npm install floway --save
```

## 使用教程

[demo 演示](https://shayelee.github.io/floway/example/todoList/index.html ":ignore")
<br>
[RxJS 相关概念](/concept.md)

### 定义状态(`stateObservable`)

使用创建操作符`state`创建一个可管理的`observable`。
这是一个特殊的`observable`，我们把它称为**`stateObservable`**

```javascript
import { state } from "floway";

const todos$ = state({
  name: "todos",
  value: [
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

### 渲染视图

React 视图组件可以通过订阅`observable`以响应状态的变化。<br>
使用`subscription`装饰器可以订阅`observable`，它会将`observable`推送的数据转换为 React 组件的`props`。

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

### 更新状态

`stateObservable` 使用 `dispatch action` 的模式来更新状态(推送新数据)。

```javascript
// file: store.js

import { state } from "floway";

const todos$ = state({
  name: "todos",
  value: [
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
  ],
  producer(next, value, action) {
    const n = action.index;
    const todos = value;
    switch (action.type) {
      case "checkItem":
        next(
          todos.map((item, i) => {
            if (i === n) {
              item.check = !item.check;
            }
            return item;
          })
        );
        break;
    }
  }
});
```

在你想要的任意位置调用`dispatch`，派遣`action`

```javascript
import { dispatch } from "floway";

dispatch("todos", {
  type: "checkItem",
  index: n
});
```

调用`dispatch`派遣`action`之后，`producer`函数就会执行，从而产生新的值并推送，`stateObservable`的当前值更新，`react`视图也会响应式地更新。<br>

!> 通过`action`推送的数据可以是任何数据类型，包括`observable`；但需要注意的是：如果是非`observable`的引用数据类型，请先新建一个副本再推送。否则，`react`视图将不会更新！

### 计算状态

使用`RxJS`操作符来动态计算`stateObservable`推送的数据

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

`undoneCount$`能够根据`todos$`推送的数据响应式地计算出有几个未完成的任务。<br>
因为`undoneCount$`也是`observable`，所以 React 组件也可以订阅它。

### React 组件之间的通信

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

#### 多个组件共享数据

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

#### 更新其它组件状态

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

## 资源

### [Github 源码](https://github.com/shayeLee/floway ":ignore")
