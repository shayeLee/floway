import React from "react";
import "./styles.scss";
import ReactDOM from "react-dom";
import TodoItem from "./todoItem";
import { subscription } from "../../../../src/index";
import { todos$, undoneCount$ } from "./todoList";

@subscription({
  todos: todos$,
  undoneCount: undoneCount$
})
class TodoList extends React.Component {
  state = {
    newTodoContent: ""
  };

  render() {
    return (
      <div className="todolist">
        <h1 className="header">任务列表</h1>
        <div className="hints">未完成任务数量：{this.props.undoneCount}</div>
        {this.props.todos.map((item, n) => {
          return (
            <TodoItem
              item={item}
              key={item.desc}
              onClick={() => this.checkItem(n)}
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
      </div>
    );
  }

  checkItem = n => {
    todos$.dispatch("checkItem", n);
  };

  handleDel = n => {
    todos$.dispatch("delItem", n);
  };

  setNewTodoContent = e => {
    const val = e.currentTarget.value;
    this.setState({
      newTodoContent: val
    });
  };

  addTodo = () => {
    todos$.dispatch("addItem", {
      desc: this.state.newTodoContent,
      check: false
    });
  };
}

window.addEventListener("load", function() {
  ReactDOM.render(<TodoList />, document.getElementById("app"));
});
