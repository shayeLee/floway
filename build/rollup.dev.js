import replace from "rollup-plugin-replace";
import sass from 'rollup-plugin-sass';
import baseConfig from "./rollup.base";

/**
 * todoList
*/
const exampleName = "todoList";

const plugins = baseConfig.plugins.slice().concat([sass({
  insert: true
})]);
plugins.splice(
  0,
  1,
  replace({
    "process.env.NODE_ENV": JSON.stringify("development")
  })
);

export default {
  input: `docs/example/${exampleName}/src/index.js`,
  watch: {
    include: ["src/**", "docs/example/**"],
    exclude: "node_modules/**"
  },
  output: {
    file: `docs/example/${exampleName}/bundle.js`,
    name: "moisten",
    sourcemap: true,
    format: "iife"
  },
  plugins
}
