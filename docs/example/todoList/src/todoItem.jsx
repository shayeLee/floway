import React from "react";

/* class TodoItem extends React.Component {
  render() {
    return (
      <div
        className={this.props.item.check ? "todo checked" : "todo"}
        onClick={this.checkItem}
      >
        <div className="todo__content">
          <img
            src={this.props.item.check ? "./static/check.png" : "./static/uncheck.png"}
            className="todo__checkbox"
          />
          <div className="desc">{this.props.item.desc}</div>
        </div>
        <a className="delbtn" onClick={this.handleDel}>删除</a>
      </div>
    );
  }

  checkItem = () => {
    this.props.onClick && this.props.onClick();
  }

  handleDel = (e) => {
    e.stopPropagation();
    this.props.onDelete && this.props.onDelete();
  }
} */

export default function TodoItem(props) {
  const checkItem = () => {
    props.onClick && props.onClick();
  }

  const handleDel = (e) => {
    e.stopPropagation();
    props.onDelete && props.onDelete();
  }

  return (
    <div
      className={props.item.check ? "todo checked" : "todo"}
      onClick={checkItem}
    >
      <div className="todo__content">
        <img
          src={props.item.check ? "./static/check.png" : "./static/uncheck.png"}
          className="todo__checkbox"
        />
        <div className="desc">{props.item.desc}</div>
      </div>
      <a className="delbtn" onClick={handleDel}>删除</a>
    </div>
  );
};
