import replace from "rollup-plugin-replace";

import baseConfig from "./rollup.base";

const plugins = baseConfig.plugins.slice();
plugins.splice(
  0,
  1,
  replace({
    "process.env.NODE_ENV": JSON.stringify("development")
  })
);

export default {
  input: "example/index.js",
  watch: {
    include: ["src/**", "example/**"],
    exclude: "node_modules/**"
  },
  output: {
    file: "dist/example.js",
    name: "moisten",
    sourcemap: true,
    format: "iife"
  },
  plugins
}
