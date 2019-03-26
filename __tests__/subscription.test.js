import React from 'react';
import renderer from 'react-test-renderer';
import { subscription, state } from "../src/index";

const str$ = state({
  name: "str",
  value: "floway"
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

  const tree = component.toJSON(); console.log(tree);
  expect(tree).toMatchSnapshot();
});