### state(descConfig)
- 参数:
  - `{object} descConfig` 状态描述配置对象
    - `{string} descConfig.name` stateObservable's name
    - `{observalbe} descConfig.initial` stateObservable's initial value from observalbe
    - `{*} descConfig.defaultValue` stateObservable's default value
    - `{function} descConfig.producer(next, value, action)` stateObservable's producer
- 返回值: `stateObservable`

### @subscription(observablesMap) component

- 参数:
  - `{object} observablesMap` 可观察对象集合
- 用法:<br>

  ?> observable 与 react 组件的集成(将 observable 推送的数据转换为组件属性)

- 示例:

  ```javascript
  import React from "react";
  import { subscription } from "floway";
  import { from } from "rxjs";

  const testData$ = from(
    new Promise(resolve => {
      setTimeout(() => {
        resolve(123);
      }, 800);
    })
  };

  @subscription({ testData: testData$ })
  class CompA extends React.Component {
    render() {
      console.log(this.props.testData) // log: 123
      return <div>{this.props.testData}</div>;
    }
  }
  ```
  如果没有启用`ES7`装饰器语法，可以用函数的写法： 
  ```javascript
  const CompA = subscription({
    testData: testData$
  })(function(props) {
    return <div>{this.props.testData}</div>;
  });
  ```

### dispatch(stateName, action)
- 参数:
  - `{string} stateName` stateObservable's name
  - `{object} action` stateObservable's action
    - `{string} action.type` action's type

