import React from "react";
import store from "./store";
const eventLog = store.eventLog;
import { isObject, isCorrectVal } from "./utils";

/**
 * observable与react组件的集成(将observable转换为组件属性)
 * @param {object} observablesMap - 可观察对象集合
 * @param {object} inputOptions - 选项
 * @param {object} inputOptions.defaultProps - 组件的默认属性
*/
const subscription = function(observablesMap, inputOptions) {
  let options = inputOptions || {};

  const handler = function(Comp) {
    if (!isObject(observablesMap))
      throw new TypeError(`方法subscription()的参数observablesMap必须是object类型`);

    class Permeate extends React.PureComponent {
      constructor() {
        super();

        this.state = {};
        this.subscriptionArr = [];
        this.suspendedObservableKeys = Object.keys(observablesMap);
        this._suspendedObservables = [];
        this._innerObservableMaps = {};
        if (this.suspendedObservableKeys.length > 0) {
          this.suspendedObservableKeys.forEach(key => {
            this._suspendedObservables.push(observablesMap[key]);
          });
        } else {
          throw new TypeError(
            `方法subscription()的参数observablesMap不允许传一个空的object`
          );
        }

        this.state = Object.assign(
          {},
          this._innerObservableMaps,
          isCorrectVal(options.defaultProps) ? options.defaultProps : {}
        );
      }

      componentWillMount() {
        const obsArr = this._suspendedObservables,
          len = obsArr.length;
        for (let i = 0; i < len; i++) {
          const subscription = obsArr[i].subscribe(data => {
            // const type = obsArr[i]["__type__"];
            // const pushHeaders = eventLog.pushHeadersMap[type];

            if (this.state[this.suspendedObservableKeys[i]] !== data) {
              // if (isCorrectVal(pushHeaders))  console.log(pushHeaders);
              this.setState({
                [this.suspendedObservableKeys[i]]: data
              });
            }
          });
          this.subscriptionArr.push(subscription);
        }
      }
      componentWillUnmount() {
        this.subscriptionArr.forEach(subscription => {
          subscription.unsubscribe();
        });
      }
      render() {
        return <Comp {...this.props} {...this.state} />;
      }
    }
    Permeate.displayName = `Permeate(${Comp.displayName ||
      Comp.name ||
      "Component"})`;
    return Permeate;
  };
  return handler;
};

export default subscription;
