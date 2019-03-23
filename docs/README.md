# Floway

**`Floway`是`flow-way`的简写，意为数据流的流动轨道！**<br>
她是`RxJS v6`的扩展库，主要功能是作为`React`应用的状态(数据流)管理工具。

## 安装

```
$ npm install floway --save
```

## 使用教程

### 定义状态(`stateObservable`)

使用创建操作符`state`创建一个可管理的`observable`。
这是一个特殊的`observable`，我们把它称为**`stateObservable`**

```javascript
// file: store.js

import { state } from "floway";

const todos$ = state({
  name: 'todos',
  value: [
    {
      desc: '起床迎接新的一天',
      check: true
    },
    {
      desc: '到达公司开始新一天的工作',
      check: true
    },
    {
      desc: '去公司附近的学校食堂吃午饭',
      check: false
    },
    {
      desc: '下班骑电动车回家',
      check: false
    },
    {
      desc: '吃晚饭，出去吃或者自己做饭吃',
      check: false
    }
  ]
});

export { todos$ }
```

### 渲染视图

React视图组件可以通过订阅`observable`以响应状态的变化。<br>
使用`subscription`装饰器可以订阅`observable`，它会将`observable`推送的数据转换为React组件的`props`。

```javascript
// file: todoList.jsx

import TodoItem from './todoItem';
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
          return (
            <TodoItem
              item={item}
              key={item.desc}
            />
          );
        })}
      </div>
    );
  }
}
```

### 更新状态

`Floway` 使用 `dispatch action` 的模式来更新状态。<br>
使用选项`actions`可以为`stateObservable`注册`action`。

```javascript
// file: store.js

import { state } from "floway";

const todos$ = state({
  name: 'todos',

  // 省略其它代码……

  actions: {
    checkItem: function(action, value) {
      const n = action.index;
      const todos = value;
      return todos.map((item, i) => {
        if (i === n) {
          item.check = !item.check;
        }
        return item;
      });
    }
  }
});

export { todos$ }
```

`actions.checkItem`的返回值可以是：基本数据类型、引用数据类型或者Observable，**如果是引用数据类型必须返回一个新数据**。<br>
它可以认为等同于以下代码: 

```javascript
import { isObservable, defer, of } from 'rxjs';
import { switchMap, merge } from 'rxjs/operators';
import { fromAction } from "floway";

const checkItem$ = fromAction("checkItem").pipe(
  switchMap(action => {
    return defer(() => {
      const _result = actions.checkItem(action, value);
      return isObservable(_result) ? _result : of(_result);
    });
  })
)
todos$.pipe(merge(checkItem$));
```

`fromAction(action.type)`是一个创建操作符，可以接收来自`dispatch`派遣的`action`.<br>
`checkItem$`将会与`todos$`合并(merge)，当调用`dispatch("todos", { type: "checkItem" })`之后，`todo$`将会把`checkItem$`产生的数据推送出去，从而使`React`视图更新

```javascript
// file: todoList.jsx

import TodoItem from './todoItem';
import { subscription, dispatch } from "floway";
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
          return (
            <TodoItem
              item={item}
              key={item.desc}
              onClick={() => this.checkItem(n)}
            />
          );
        })}
      </div>
    );
  };

  checkItem = n => {
    dispatch("todos", {
      type: 'checkItem',
      index: n
    });
  };
}
```

### 计算状态

使用`RxJS`操作符来动态计算`stateObservable`推送的数据

```javascript
// file: store.js

import { state } from "floway";
import { map } from 'rxjs/operators';

const todos$ = state({
  name: "todos"

  // 省略部分代码……

});

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

export { todos$, undoneCount$ };
```

`undoneCount$`能够根据`todos$`推送的数据响应式地计算出有几个未完成的任务。<br>
因为`undoneCount$`也是`observable`，所以React组件可以订阅它。

```javascript
// file: todoList.jsx

import { subscription } from "floway";
import { undoneCount$ } from "./store";

@subscription({
  undoneCount: undoneCount$
})
class TodoList extends React.Component {
  render() {
    return (
      <div className="todolist">
        <h1 className="header">任务列表</h1>
        <div className="hints">未完成任务数量：{this.props.undoneCount}</div>
        { /** 省略其它代码…… */ }
      </div>
    );
  }

  // 省略其它代码……

}
```

### React组件之间的通信

假设现在有 `TodoList` 和 `Toast` 这两个组件

```javascript
// file: index.js

class Root extends React.Component {
  render() {
    return (
      <div className="root">
        <TodoList />
        <Toast />
      </div>
    )
  }
}
```

#### 多个组件共享数据

多个组件订阅相同的`observable`即可共享数据

```javascript
// file: todoList.jsx

import { undoneCount$ } from './store';

@subscription({
  undoneCount: undoneCount$
})
class TodoList extends React.Component {
  render() {
    <div className="todolist">
      <div className="hints">未完成任务数量：{this.props.undoneCount}</div>
      { /** 省略部分代码…… */ }
    </div>
  }
}
```

```javascript
// file: toast.jsx

import { undoneCount$ } from './store';

@subscription({
  undoneCount: undoneCount$
})
class Toast extends React.Component {
  render() {
    return (
      { /** 省略部分代码…… */ }
      <div className="totast__inner">
        恭喜你完成了一个任务，还有 {this.props.undoneCount} 个任务未完成，请继续努力。
      </div>
    )
  }
}
```

#### 更新其它组件状态

调用 `dispatch` 即可更新任意组件的状态

```javascript
// file: todoList.jsx

import { dispatch } from "floway";

class TodoList extends React.Component {
  // 省略部分代码……

  checkItem = () => {
    dispatch("toastVisible", {
      type: "show"
    });
  };
}
```

当 `dispatch("toastVisible", { type: "show" })` 被调用后，组件`Toast`就会显示在界面中

```javascript
// file: toast.jsx

import { subscription } from "floway";
import { toastVisible$ } from "./store";

@subscription({
  toastVisible: toastVisible$
})
class Toast extends React.Component {
  render() {
    <div className="toast" style={!this.props.toastVisible ? { display: "none" } : {}}>
      { /** 省略部分代码…… */ }
    </div>
  }
}
```

