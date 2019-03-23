import React from 'react';
import ReactDOM from 'react-dom';
import './styles.scss';
import TodoList from "./todoList";
import Toast from "./toast";

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

window.addEventListener('load', function() {
  ReactDOM.render(<Root />, document.getElementById('app'));
});
