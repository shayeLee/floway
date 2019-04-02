import React from 'react';
import TodoItem from './todoItem';
import { subscription, dispatch } from '../../../../src/index';
import { todos$, undoneCount$ } from './store';

const UndoneCount = subscription({
  undoneCount: undoneCount$
})(function(props) {
  return (
    <div className="hints">未完成任务数量：{props.undoneCount}</div>
  );
})

@subscription({
  todos: todos$
})
class TodoList extends React.Component {
  state = {
    newTodoContent: ''
  };

  render() {
    return (
      <div className="todolist">
        <h1 className="header">任务列表</h1>
        <UndoneCount />
        {this.props.todos.map((item, n) => {
          return (
            <TodoItem
              item={item}
              key={item.desc}
              onClick={() => this.checkItem(n, item)}
              onDelete={() => this.handleDel(n)}
            />
          );
        })}
        <div className="todolist__adder">
          <input
            className="todolist__input"
            type="text"
            placeholder="安排新的任务吧……"
            value={this.state.newTodoContent}
            onChange={this.setNewTodoContent}
          />
          <button className="todolist__btn" onClick={this.addTodo}>
            添加任务
          </button>
        </div>
        <a href="https://github.com/shayeLee/floway/tree/master/docs/example/todoList/src" target="_blank">完整源码</a>
      </div>
    );
  }

  checkItem = (n, item) => {
    if (!item.check) {
      dispatch("toastVisible", {
        type: "show"
      });  
    }
    dispatch("todos", {
      type: "checkItem",
      index: n
    });
  };

  handleDel = n => {
    dispatch("todos", {
      type: "delItem",
      index: n
    });
  };

  setNewTodoContent = e => {
    const val = e.currentTarget.value;
    this.setState({
      newTodoContent: val
    });
  };

  addTodo = () => {
    dispatch("todos", {
      type: "addItem",
      item: {
        desc: this.state.newTodoContent,
        check: false
      }
    });
  };
}

export default TodoList;