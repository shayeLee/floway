import React from "react";
import ReactDOM from "react-dom";
import { of } from "rxjs";
import { permeate, registerState, store } from "../src/index";

const obs$ = registerState({
  name: "count",
  action: {
    plus(count) {
      return ++count;
    },
    minus(count) {
      return --count;
    }
  }
})(of(1));

@permeate({
  data: obs$
})
class CompA extends React.Component {
  render() {
    return (
      <div style={{ marginBottom: "5px" }}>CompA's count:  <span style={{ color: "red" }}>{this.props.data}</span></div>
    )
  }
}

@permeate({
  data: obs$
})
class CompB extends React.Component {
  render() {
    return (
      <div style={{ marginBottom: "12px" }}>CompB's count:  <span style={{ color: "blue" }}>{this.props.data}</span></div>
    )
  }
}

class RootComp extends React.Component {
  render() {
    return (
      <div>
        <CompA />
        <CompB />
        <div>
          <button style={{ marginRight: "8px" }} onClick={() => {
            store.update("count", "plus");
          }}>plus one</button>
          <button onClick={() => {
            store.update("count", "minus");
          }}>minus one</button>
        </div>
      </div>
    )
  }
}

window.addEventListener("load", function() {
  ReactDOM.render(<RootComp />, document.getElementById("app"));
});