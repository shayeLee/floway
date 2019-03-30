import React from 'react';
import renderer from 'react-test-renderer';
import { subscription, state } from "../src/index";

const str$ = state({
  name: "str",
  defaultValue: "floway"
});

@subscription({
  str: str$
})
class TestComp extends React.Component {
  render() {
    return (
      <div>{this.props.str}</div>
    )
  }
}

test("test @subscription", () => {
  const component = renderer.create(
    <TestComp />
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test("test @subscription with empty object param", () => {
  expect(() => {
    @subscription({})
    class Comp extends React.Component {
      render() {
        return (
          <div></div>
        )
      }
    }

    renderer.create(
      <Comp />
    );
  }).toThrow();
});

test("test @subscription with erring param", () => {
  expect(() => {
    subscription([str$])(function (props) {
      return (
        <div>props.str</div>
      )
    })
  }).toThrow();
});