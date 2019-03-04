import React from "react";
import ofHot from "./ofHot";
import rxStore from "./store";
import { isObject, isCorrectVal } from "./utils";

/**
 * observable与react组件的集成(将observable转换为组件属性)
 * @param {object} observablesMap - 可观察对象集合
 * @param {object} inputOptions - 选项
 * @param {object} inputOptions.defaultProps - 组件的默认属性
 * @param {array} inputOptions.delayeringFields - 推送数据需要扁平化的可观察对象的key
 * @example
 * import { permeate } from "rx-samsara";
 * import { from } from "rxjs";
 * 
 * const testData$ = from(
 *   new Promise(resolve => {
 *     setTimeout(() => {
 *       resolve(123);
 *     }, 800);
 *   })
 * };
 * 
 * class CompA extends React.Component {
 *   render() {
 *     // this.props.testData === 123
 *     return <div>{this.props.testData}</div>;
 *   }
 * }
 * 
 * export default permeate({ testData: testData$ })(CompA);
*/
const permeate = function(observablesMap, inputOptions) {
  let options = inputOptions || {};

  const handler = function(Comp) {
    if (!isObject(observablesMap))
      throw new TypeError(`方法permeate()的参数observablesMap必须是object类型`);

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
            let _observable;
            if (typeof observablesMap[key]["subscribe"] !== "function") {
              _observable = ofHot(observablesMap[key]);
              this._innerObservableMaps[`${key}$`] = _observable;
              this.state[key] = observablesMap[key];
            } else {
              _observable = observablesMap[key];
            }
            this._suspendedObservables.push(_observable);
          });
        } else {
          throw new TypeError(
            `方法permeate()的参数observablesMap不允许传一个空的object`
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
            const type = obsArr[i]["__type__"];
            const pushHeaders = rxStore.pushHeadersMap[type];

            if (
              options.delayeringFields &&
              options.delayeringFields.includes(this.suspendedObservableKeys[i])
            ) {
              const _stateObj = {};
              for (const key in data) {
                if (this.state[key] !== data[key]) {
                  _stateObj[key] = data[key];
                }
              }
              // if (isCorrectVal(pushHeaders))  console.log(pushHeaders);
              this.setState(_stateObj);
              return;
            }

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
export default permeate;
