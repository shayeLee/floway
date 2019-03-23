# Floway

**`Floway`是`flow-way`的简写，意为数据流的流动轨道！**<br>
她是`RxJS v6`的扩展库，主要功能是作为`React`应用的状态(数据流)管理工具。

## 安装

```
$ npm install floway --save
```

## 开始使用

#### 1. 定义状态

使用创建操作符`state`创建一个可管理的`observable`

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

#### 2. React视图组件订阅`observable`以响应状态的变化

使用`subscription`装饰器可以订阅`observable`，它会将`observable`推送的数据转换为React组件的`props`

```javascript
// file: index.js

import React from "react";
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

#### 3. 使用 `dispatch action` 的模式来更新状态

```javascript
// file: store.js

import { state } from "floway";
import { of } from 'rxjs';

const todos$ = state({
  name: 'todos',

  // 省略其它代码……

  fromAction: {
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

以上代码的`fromAction.checkItem`的返回值可以是：基本数据类型、引用数据类型或者Observable；它可以认为等同于以下代码: 

```javascript
import { fromAction } from "floway";

fromAction("todos#checkItem").pipe(
  switchMap(action => {
    return defer(() => of(checkItem(action, value)));
  })
)
```

`fromAction(action.type)`是一个操作符，可以接收来自`dispatch`派遣的`action`.<br>
`fromAction.checkItem`将会与`todos$`合并(merge)，当调用`dispatch("todos#checkItem")`之后，`todo$`将会推送新的数据，从而使`React`视图更新

```javascript
// file: index.js

import React from "react";
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
    dispatch({
      type: 'todos#checkItem',
      index: n
    });
  };
}
```

