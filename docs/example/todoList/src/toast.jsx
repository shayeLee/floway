import React from "react";
import { subscription, dispatch } from "../../../../src/index";
import { undoneCount$, toastVisible$ } from "./store";

@subscription({
  toastVisible: toastVisible$,
  undoneCount: undoneCount$
})
class Toast extends React.Component {
  static defaultProps = {
    toastVisible: false,
    undoneCount: 0
  }

  render() {
    return (
      <div className="toast" style={!this.props.toastVisible ? { display: "none" } : {}}>
        <div className="totast__inner">
          {
            (this.props.undoneCount === 0) ? 
              <div>恭喜你，你已完成全部任务</div> :
                <div>恭喜你完成了一个任务，还有 <span style={{ color: "red" }}>{this.props.undoneCount}</span> 个任务未完成，请继续努力。</div>
          }
        </div>
      </div>
    )
  }

  componentDidUpdate() {
    if (this.props.toastVisible) {
      setTimeout(function() {
        dispatch("toastVisible", {
          type: "hide"
        });
      }, 1500)
    }
  }
}

export default Toast;